// /tools/vinyl-decoder.js — Vinyl Matrix / Runout Code Decoder
// Loaded statically by /tools/vinyl-decoder.html via <script src="vinyl-decoder.js"></script>.
// Self-contained IIFE; no globals leak. Reference data loaded async from vinyl-runout-data.json.
//
// This is deliberately NOT the sequential-wizard pattern used by wizard.js. Runout/matrix
// conventions are crowd-documented, regional, and full of gaps — there is no single closed
// registry to walk through step by step. Instead this is a fuzzy, ranked-candidate matcher:
// the user types what they can read (using `?` for any character they can't make out), picks
// any symbols they can see, and every documented code gets scored against that input. Every
// result carries an honest confidence tier — never a bare assertion.

(function () {
    'use strict';

    const DATA_URL = 'vinyl-runout-data.json';
    const TIER_RANK = { 'well-documented': 3, 'commonly cited, some disagreement': 2, 'possible, low confidence': 1 };
    const RANK_TIER = { 3: 'well-documented', 2: 'commonly cited, some disagreement', 1: 'possible, low confidence' };

    let DATA = null;
    const selectedSymbols = new Set();

    // -- MATCHING ENGINE -----------------------------------------------------

    // Strip everything except letters, digits and '?' — used for the fuzzy/coverage matcher
    // so punctuation and spacing differences between how the reference code is written and how
    // someone transcribed it don't block a match.
    function compact(s) {
        return s.toUpperCase().replace(/[^A-Z0-9?]/g, '');
    }

    // Whole-token match for short (<=2 char) codes. Short codes are matched as an isolated
    // token rather than a substring-anywhere search, because a 2-character needle turns up
    // constantly by coincidence inside catalog numbers and other unrelated text. '?' in either
    // side counts as a wildcard.
    function isolatedTokenMatch(codeCompact, tokens) {
        let best = null;
        for (const token of tokens) {
            if (token.length !== codeCompact.length) continue;
            let wildcards = 0, ok = true;
            for (let i = 0; i < token.length; i++) {
                const a = codeCompact[i], b = token[i];
                if (a === '?' || b === '?') { wildcards++; continue; }
                if (a !== b) { ok = false; break; }
            }
            if (!ok) continue;
            const score = Math.max(0.6, 1 - 0.15 * wildcards);
            if (!best || score > best.score) best = { score, wildcardsUsed: wildcards > 0 };
        }
        return best;
    }

    // Fuzzy substring/coverage match for longer (>2 char) codes. Slides the reference code
    // (needle) over the user's text (haystack) at every offset, including offsets where only
    // part of the needle overlaps the haystack — that's what lets a partial transcription like
    // just "PORKY" still match the longer "A PORKY PRIME CUT" alias, and lets a full code match
    // even when it's embedded in a longer runout string. '?' on either side is a wildcard that
    // costs some confidence rather than blocking the match outright.
    function fuzzyMatch(codeCompact, haystackCompact) {
        const needle = codeCompact;
        if (!needle.length || !haystackCompact.length) return null;
        let best = null;
        for (let offset = -(needle.length - 1); offset <= haystackCompact.length - 1; offset++) {
            let counted = 0, matchScore = 0, wildcards = 0, valid = true;
            for (let i = 0; i < needle.length; i++) {
                const pos = offset + i;
                if (pos < 0 || pos >= haystackCompact.length) continue; // outside overlap — not evidence either way
                counted++;
                const nc = needle[i], hc = haystackCompact[pos];
                if (nc === '?' || hc === '?') { wildcards++; matchScore += 0.65; }
                else if (nc === hc) { matchScore += 1; }
                else { valid = false; break; }
            }
            if (!valid || counted === 0) continue;
            const coverage = counted / needle.length;
            const charScore = matchScore / counted;
            const finalScore = charScore * coverage;
            if (!best || finalScore > best.score) best = { score: finalScore, wildcardsUsed: wildcards > 0, counted };
        }
        if (!best) return null;
        const minCounted = Math.max(3, Math.ceil(needle.length * 0.4));
        if (best.counted < minCounted || best.score < 0.5) return null;
        return best;
    }

    // Tries every alias in entry.codes against the given text + selected symbol set, returns
    // the single best-scoring alias match for this entry (or null if nothing cleared threshold).
    function matchLiteralEntry(entry, text, tokens, haystackCompact) {
        let best = null;
        for (const code of entry.codes || []) {
            let result = null;
            if (code.startsWith('SEL:')) {
                if (selectedSymbols.has(code)) result = { score: 1, wildcardsUsed: false, method: 'selected' };
            } else if (/^[^A-Za-z0-9]+$/.test(code)) {
                // Pure symbol/glyph — matched as a literal substring in the raw text, or via the picker.
                if (selectedSymbols.has(code) || text.includes(code)) {
                    result = { score: 1, wildcardsUsed: false, method: 'selected' };
                }
            } else {
                const codeCompact = compact(code);
                if (codeCompact.length <= 2) {
                    const m = isolatedTokenMatch(codeCompact, tokens);
                    if (m) result = { score: m.score, wildcardsUsed: m.wildcardsUsed, method: 'isolated-token', aliasLen: codeCompact.length };
                } else {
                    const m = fuzzyMatch(codeCompact, haystackCompact);
                    if (m) result = { score: m.score, wildcardsUsed: m.wildcardsUsed, method: 'fuzzy' };
                }
            }
            if (result && (!best || result.score > best.score)) { best = result; best.alias = code; }
        }
        return best;
    }

    function matchRegexEntry(entry, rawUpper) {
        try {
            const re = new RegExp(entry.regex, 'i');
            const m = rawUpper.match(re);
            if (!m) return null;
            const result = { score: 1, wildcardsUsed: false, method: 'pattern' };
            if (entry.type === 'regex_capture' && entry.template) {
                result.explanationOverride = entry.template.replace('{1}', m[1]).replace('{2}', m[2]);
            }
            return result;
        } catch (e) {
            return null;
        }
    }

    function matchSuffixEntry(entry, rawUpper) {
        const trimmed = rawUpper.trim();
        if (/(^|[^A-Z])[AB]([12])?$/.test(trimmed)) return { score: 1, wildcardsUsed: false, method: 'pattern' };
        return null;
    }

    function tierFor(entry, match) {
        let rank = TIER_RANK[entry.confidence] || 1;
        let note = null;
        if (match.method === 'fuzzy') {
            if (match.score < 0.65) { rank = Math.max(1, rank - 2); note = 'fuzzy match — several characters unclear or only part of the code matched'; }
            else if (match.score < 0.999) { rank = Math.max(1, rank - 1); note = 'fuzzy match — some characters unclear or only part of the code matched'; }
        } else if (match.method === 'isolated-token' && match.wildcardsUsed) {
            rank = Math.max(1, rank - 1);
            note = 'matched allowing for an unclear character';
        }
        if (match.method === 'isolated-token' && match.aliasLen === 1) {
            rank = 1; // single-character codes are always capped at the lowest tier — too ambiguous to state more strongly
        }
        return { confidence: RANK_TIER[rank], note };
    }

    // Runs the whole entry list against one input field (runout text or SID text), scoped by
    // entry.scope ('runout' by default, or 'sid'). Returns a ranked array of match objects.
    function decode(text, scope) {
        const rawUpper = text.toUpperCase();
        const tokens = rawUpper.split(/[^A-Z0-9?]+/).filter(Boolean);
        const haystackCompact = compact(text);
        const results = [];

        for (const entry of DATA.entries) {
            const entryScope = entry.scope || 'runout';
            if (entryScope !== scope) continue;

            let match = null;
            if (entry.type === 'regex' || entry.type === 'regex_capture') match = matchRegexEntry(entry, rawUpper);
            else if (entry.type === 'suffix') match = matchSuffixEntry(entry, rawUpper);
            else match = matchLiteralEntry(entry, rawUpper, tokens, haystackCompact);

            if (!match) continue;
            const tier = tierFor(entry, match);
            results.push({
                entry,
                score: match.score,
                rank: TIER_RANK[tier.confidence],
                confidence: tier.confidence,
                fuzzNote: tier.note,
                explanation: match.explanationOverride ? entry.explanation + ' ' + match.explanationOverride : entry.explanation
            });
        }

        results.sort((a, b) => (b.rank - a.rank) || (b.score - a.score));
        return results;
    }

    // -- UI --------------------------------------------------------------------

    function el(tag, attrs, children) {
        const node = document.createElement(tag);
        if (attrs) for (const k in attrs) {
            if (k === 'text') node.textContent = attrs[k];
            else if (k === 'html') node.innerHTML = attrs[k];
            else node.setAttribute(k, attrs[k]);
        }
        if (children) for (const c of children) node.appendChild(c);
        return node;
    }

    function buildSymbolPicker(container) {
        const symbolEntries = DATA.entries.filter(e => e.symbol_label);
        container.innerHTML = '';
        for (const entry of symbolEntries) {
            const code = (entry.codes || []).find(c => c.startsWith('SEL:')) || (entry.codes || [])[0];
            const btn = el('button', { type: 'button', class: 'symbol-chip', 'data-code': code });
            btn.textContent = entry.symbol_label;
            btn.addEventListener('click', () => {
                if (selectedSymbols.has(code)) { selectedSymbols.delete(code); btn.classList.remove('selected'); btn.setAttribute('aria-pressed', 'false'); }
                else { selectedSymbols.add(code); btn.classList.add('selected'); btn.setAttribute('aria-pressed', 'true'); }
                runDecode();
            });
            btn.setAttribute('aria-pressed', 'false');
            container.appendChild(btn);
        }
    }

    function renderResults(runoutMatches, sidMatches) {
        const out = document.getElementById('vinyl-results');
        out.innerHTML = '';

        const all = runoutMatches.map(m => ({ ...m, field: 'runout' })).concat(sidMatches.map(m => ({ ...m, field: 'sid' })));

        if (all.length === 0) {
            out.appendChild(el('div', { class: 'vinyl-empty' }, [
                el('p', { html: '<strong>Nothing in our documented set matches that yet.</strong> That doesn’t mean it’s fake or meaningless — this space is full of conventions nobody has written down anywhere. Two things worth trying:' }),
                el('ul', {}, [
                    el('li', { html: 'Search the exact text you typed (keep the <code>?</code> in) directly on <a href="https://www.discogs.com/" target="_blank" rel="noopener">Discogs</a> — sometimes a specific pressing’s runout has already been catalogued there even though it’s not a documented general convention.' }),
                    el('li', { html: 'Double-check what you typed against the record itself under angled light — a stray character can throw the match off.' })
                ])
            ]));
            return;
        }

        for (const m of all) {
            const row = el('div', { class: 'vinyl-result-row' });
            row.appendChild(el('div', { class: 'vinyl-result-head' }, [
                el('span', { class: 'vinyl-result-code', text: m.entry.display }),
                el('span', { class: 'vinyl-confidence vinyl-confidence-' + m.rank, text: m.confidence })
            ]));
            row.appendChild(el('div', { class: 'vinyl-result-title', text: m.entry.result }));
            row.appendChild(el('div', { class: 'vinyl-result-explanation', text: m.explanation }));
            if (m.fuzzNote) row.appendChild(el('div', { class: 'vinyl-result-note', text: '⚠ ' + m.fuzzNote.charAt(0).toUpperCase() + m.fuzzNote.slice(1) + '.' }));
            if (m.entry.caveat) row.appendChild(el('div', { class: 'vinyl-result-caveat', text: 'Caveat: ' + m.entry.caveat }));
            row.appendChild(el('div', { class: 'vinyl-result-source', text: 'Source: ' + m.entry.source + (m.field === 'sid' ? ' · matched from the SID field' : '') }));
            out.appendChild(row);
        }
    }

    function runDecode() {
        const runoutText = document.getElementById('vinyl-runout-input').value || '';
        const sidText = document.getElementById('vinyl-sid-input').value || '';
        const hasInput = runoutText.trim() || sidText.trim() || selectedSymbols.size;
        if (!hasInput) {
            const out = document.getElementById('vinyl-results');
            out.innerHTML = '';
            out.appendChild(el('div', { class: 'vinyl-empty' }, [el('p', { text: 'Type something above to see matches.' })]));
            return;
        }
        const runoutMatches = runoutText.trim() || selectedSymbols.size ? decode(runoutText, 'runout') : [];
        const sidMatches = sidText.trim() ? decode(sidText, 'sid') : [];
        renderResults(runoutMatches, sidMatches);
    }

    function init() {
        const runoutInput = document.getElementById('vinyl-runout-input');
        const sidInput = document.getElementById('vinyl-sid-input');
        const symbolContainer = document.getElementById('vinyl-symbol-picker');
        if (!runoutInput) return;

        buildSymbolPicker(symbolContainer);

        let debounceTimer = null;
        const scheduleDecode = () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(runDecode, 150); };
        runoutInput.addEventListener('input', scheduleDecode);
        sidInput.addEventListener('input', scheduleDecode);

        document.querySelectorAll('.vinyl-example').forEach(btn => {
            btn.addEventListener('click', () => {
                runoutInput.value = btn.getAttribute('data-example');
                runDecode();
                runoutInput.focus();
            });
        });

        runDecode();
    }

    if (typeof document !== 'undefined') {
        fetch(DATA_URL)
            .then(r => r.json())
            .then(json => { DATA = json; init(); })
            .catch(err => {
                const out = document.getElementById('vinyl-results');
                if (out) out.textContent = 'Could not load the reference data (' + err.message + ').';
            });
    }

    // Test hook (Node only) — lets a script exercise the matching engine directly against the
    // JSON data without a DOM. Not loaded/used by the browser.
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { decode, setData: d => { DATA = d; } };
    }
})();
