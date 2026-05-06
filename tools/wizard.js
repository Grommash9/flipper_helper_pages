// /tools/wizard.js — UK Silver Hallmark Identifier wizard
// Loaded statically by /tools/uk-silver-hallmarks.html via <script src="wizard.js"></script>.
// Self-contained IIFE; no globals leak. Pre-1975 cycle data is loaded async from
// images/hallmarks/data/cycles.json (built by tools/scrape-silvermakersmarks.js).

(function () {
    'use strict';

    // -- STATIC DATA -------------------------------------------------------
    const SOLID = [
        { id: 'solid', glyph: 'SILVER', name: 'Solid silver', sub: 'Has assay marks (lion, anchor, leopard, etc.)' },
        { id: 'plated', glyph: 'PLATE', name: 'Silver plate', sub: 'Marked EPNS / A1 / Sheffield Plate' },
        { id: 'unsure', glyph: '?', name: 'Not sure', sub: 'Show me the difference' }
    ];

    const STANDARD = {
        'lion-passant':  { name: 'Lion Passant', sub: 'Sterling 925 — England', glyph: 'LION', purity: 'sterling silver (925/1000)', region: 'England (also Wales)', from: 1544, system: 'english', note: "The Lion Passant has been the compulsory standard mark for sterling silver assayed in England since 1544." },
        'britannia':     { name: 'Britannia figure', sub: 'Britannia 958 — England', glyph: 'BRIT', purity: 'Britannia silver (958/1000)', region: 'England', from: 1697, system: 'english', note: "Higher-purity standard introduced in 1697. Compulsory until 1720, optional since." },
        'lion-rampant':  { name: 'Lion Rampant', sub: 'Sterling 925 — Scotland', glyph: 'L-R', purity: 'sterling silver (925/1000)', region: 'Scotland', from: 1759, system: 'scottish', note: "Sterling silver standard mark used historically by Glasgow Assay Office, and adopted by Edinburgh from 1975." },
        'thistle':       { name: 'Thistle', sub: 'Sterling 925 — Edinburgh 1759–1974', glyph: 'THIS', purity: 'sterling silver (925/1000)', region: 'Scotland (Edinburgh)', from: 1759, to: 1974, system: 'scottish-edinburgh', note: "Edinburgh standard mark for sterling silver, in use 1759–1974. Replaced by the Lion Rampant in 1975 under the unified UK system." },
        'crowned-harp':  { name: 'Crowned Harp', sub: 'Sterling 925 — Dublin', glyph: 'HARP', purity: 'sterling silver (925/1000)', region: 'Dublin (Republic of Ireland)', from: 1638, system: 'irish', note: "The Crowned Harp is the standard mark for Dublin Assay Office silver. The Republic of Ireland operates a separate hallmarking system." },
        'num-925':       { name: '925 numerical', sub: 'Sterling 925', glyph: '925', purity: 'sterling silver (925/1000)', region: 'Convention or modern UK', from: 1973, note: "Modern numerical fineness mark, often alongside the Lion Passant." },
        'num-958':       { name: '958 numerical', sub: 'Britannia 958', glyph: '958', purity: 'Britannia silver (958/1000)', region: 'Convention or modern UK', from: 1973 },
        'num-950':       { name: '950 numerical', sub: 'Continental — French', glyph: '950', purity: '950/1000 silver (95% — French standard, above sterling)', region: 'France and other Continental', from: 1838, note: "950 silver is the standard French fineness ('Premier Titre'), accompanied on French pieces by the Minerva head mark from 1838 onwards. Higher purity than sterling." },
        'num-900':       { name: '900 numerical', sub: 'Continental — coin silver', glyph: '900', purity: '900/1000 silver (90%)', region: 'Continental Europe / Eastern European / coin silver', from: 1800, note: "Common on Russian, Eastern European, and 'coin silver' pieces. Below sterling fineness. Often imported as scrap value rather than collector pieces." },
        'num-833':       { name: '833 numerical', sub: 'Continental — N. Europe', glyph: '833', purity: '833/1000 silver (83.3%)', region: 'Northern Europe (Portugal, Sweden, Netherlands, Norway)', from: 1800, note: "833 fineness is common on Portuguese, Scandinavian, and Dutch silver. Below sterling but recognised by international convention." },
        'num-800':       { name: '800 numerical', sub: 'Continental — German/Italian', glyph: '800', purity: '800/1000 silver (80%)', region: 'Germany, Italy, and other Continental Europe', from: 1888, note: "Common on German (Reichssilber) and Italian Continental pieces. Below sterling but recognised by the International Convention on Hallmarks." },
        'num-999':       { name: '999 numerical', sub: 'Fine silver', glyph: '999', purity: 'fine silver (999/1000)', region: 'Convention', from: 1973 }
    };

    const TOWN = {
        'leopard-uncrowned':       { name: "Leopard's Head", sub: "London — uncrowned, 1822+", glyph: "LEO", office: 'London',     from: 1822, to: null, systems: ['english'], note: "London removed the crown from its leopard's head in 1822." },
        'leopard-crowned':         { name: "Leopard's Head", sub: "London — crowned, 1478–1821", glyph: "LEO+", office: 'London',  from: 1478, to: 1821, systems: ['english'] },
        'anchor':                  { name: 'Anchor',                 sub: 'Birmingham 1773+',     glyph: 'ANC',    office: 'Birmingham', from: 1773, to: null, systems: ['english'] },
        'rose-sheffield':          { name: 'Yorkshire Rose',         sub: 'Sheffield 1975+',      glyph: 'ROSE',   office: 'Sheffield', from: 1975, to: null, systems: ['english'] },
        'crown-sheffield':         { name: 'Crown',                  sub: 'Sheffield 1773–1974',  glyph: 'CRWN',   office: 'Sheffield', from: 1773, to: 1974, systems: ['english'] },
        'castle-edinburgh':        { name: 'Three-towered castle',   sub: 'Edinburgh 1457+',      glyph: 'CAST',   office: 'Edinburgh', from: 1457, to: null, systems: ['scottish','scottish-edinburgh'] },
        'tree-fish-bell':          { name: 'Tree, fish & bell',      sub: 'Glasgow 1681–1964',    glyph: 'GLA',    office: 'Glasgow',   from: 1681, to: 1964, systems: ['scottish'] },
        'wheat-sword-chester':     { name: 'Wheat-sheaves & sword',  sub: 'Chester 1701–1962',    glyph: 'CHE',    office: 'Chester',   from: 1701, to: 1962, systems: ['english'] },
        'three-castles-newcastle': { name: 'Three castles',          sub: 'Newcastle 1702–1884',  glyph: 'NEW',    office: 'Newcastle', from: 1702, to: 1884, systems: ['english'] },
        'castle-exeter':           { name: 'Three-towered castle',   sub: 'Exeter 1701–1883',     glyph: 'EXE',    office: 'Exeter',    from: 1701, to: 1883, systems: ['english'], note: "Exeter's castle is visually similar to Edinburgh's but English." },
        'lions-york':              { name: 'Five lions on cross',    sub: 'York 1700–1858',       glyph: 'YRK',    office: 'York',      from: 1700, to: 1858, systems: ['english'] },
        'dublin':                  { name: 'Crowned Harp + Hibernia', sub: 'Dublin 1638+',        glyph: 'DUB',    office: 'Dublin',    from: 1638, to: null, systems: ['irish'], note: "Dublin Assay Office. The crowned harp is both the standard mark and the office mark; Hibernia (seated woman) appears alongside it from 1730 onwards. The Republic of Ireland operates a separate hallmarking system." }
    };

    const DUTY = {
        'george-iii':  { name: 'George III',     sub: '1784–1820',  glyph: 'G3', monarch: 'George III', from: 1784, to: 1820 },
        'george-iv':   { name: 'George IV',      sub: '1820–1830',  glyph: 'G4', monarch: 'George IV', from: 1820, to: 1830 },
        'william-iv':  { name: 'William IV',     sub: '1830–1837',  glyph: 'W4', monarch: 'William IV', from: 1830, to: 1837 },
        'victoria':    { name: 'Queen Victoria', sub: '1837–1890',  glyph: 'V',  monarch: 'Queen Victoria', from: 1837, to: 1890 },
        'any':         { name: 'Unidentified head', sub: 'Some monarch profile, 1784–1890', glyph: '?', monarch: 'unidentified', from: 1784, to: 1890 }
    };

    const COMMEM = {
        'jubilee-1935':         { name: 'Silver Jubilee 1935', sub: 'George V', glyph: '1935', from: 1933, to: 1935, label: 'George V Silver Jubilee' },
        'coronation-1953':      { name: 'Coronation 1953',     sub: 'Elizabeth II', glyph: '1953', from: 1952, to: 1953, label: 'Elizabeth II Coronation' },
        'silver-jubilee-1977':  { name: 'Silver Jubilee 1977', sub: 'Elizabeth II', glyph: '1977', from: 1977, to: 1977, label: 'Elizabeth II Silver Jubilee' },
        'millennium-2000':      { name: 'Millennium 2000',     sub: '', glyph: '2000', from: 1999, to: 2000, label: 'Millennium 2000' },
        'diamond-jubilee-2012': { name: 'Diamond Jubilee',     sub: 'Elizabeth II', glyph: '2012', from: 2011, to: 2012, label: 'Elizabeth II Diamond Jubilee' },
        'platinum-jubilee-2022':{ name: 'Platinum Jubilee',    sub: 'Elizabeth II', glyph: '2022', from: 2022, to: 2022, label: 'Elizabeth II Platinum Jubilee' },
        'charles-iii-2023':     { name: 'Charles III Coronation', sub: '2023', glyph: '2023', from: 2023, to: 2023, label: 'Charles III Coronation' }
    };

    // Loaded async from images/hallmarks/data/cycles.json. Shape:
    // { london: { office: 'London', cycles: [{ key, from, to, frame, letters: [{year, letter, case, glyph}] }] }, ... }
    let CYCLES = {};

    // -- STATE --------------------------------------------------------------
    const state = { solid: null, standard: null, town: null, duty: null, commemorative: null, cycle: null, dateletter: null };
    const STEPS = ['standard','town','duty','commemorative','cycle','dateletter'];

    // -- DATA ACCESSORS (with cycle/dateletter dynamic) ---------------------
    function officeOf(townId) {
        const t = TOWN[townId];
        return t ? t.office.toLowerCase() : null;
    }
    function cyclesForCurrentOffice() {
        if (!state.town) return [];
        const office = officeOf(state.town);
        const data = CYCLES[office];
        return data ? data.cycles : [];
    }
    function getSource(stepKey) {
        if (stepKey === 'cycle') {
            const out = {};
            for (const c of cyclesForCurrentOffice()) out[c.key] = c;
            return out;
        }
        if (stepKey === 'dateletter') {
            if (!state.cycle) return {};
            const cycles = cyclesForCurrentOffice();
            const cycle = cycles.find(c => c.key === state.cycle);
            if (!cycle) return {};
            const out = {};
            for (const l of cycle.letters) {
                const id = `${l.year}-${l.letter}-${l.case}`;
                out[id] = l;
            }
            return out;
        }
        return ({ standard: STANDARD, town: TOWN, duty: DUTY, commemorative: COMMEM })[stepKey] || {};
    }

    const RANGE_OF = {
        standard:      function (opt) { return { from: opt.from, to: opt.to || null }; },
        town:          function (opt) { return { from: opt.from, to: opt.to }; },
        duty:          function (opt) { return { from: opt.from, to: opt.to }; },
        commemorative: function (opt) { return { from: opt.from, to: opt.to }; },
        cycle:         function (opt) { return { from: opt.from, to: opt.to }; },
        dateletter:    function (opt) { return { from: opt.year, to: opt.year }; }
    };

    function townMatchesStandard(townOpt, stdOpt) {
        if (!stdOpt) return true;
        if (stdOpt.system === undefined && /^num-/.test(stdOpt.id || '')) return true;
        const stdSys = stdOpt.system;
        if (!stdSys) return true;
        return (townOpt.systems || []).indexOf(stdSys) !== -1
            || (stdSys === 'scottish' && (townOpt.systems || []).indexOf('scottish-edinburgh') !== -1);
    }

    function intersect(a, b) {
        const from = Math.max(a.from, b.from);
        const aTo = a.to == null ? 9999 : a.to;
        const bTo = b.to == null ? 9999 : b.to;
        const to = Math.min(aTo, bTo);
        if (to < from) return null;
        return { from: from, to: to === 9999 ? null : to };
    }
    function intersectRanges(arr) {
        let r = { from: -10000, to: null };
        for (const x of arr) {
            if (!x) continue;
            const next = intersect(r, x);
            if (!next) return null;
            r = next;
        }
        return r;
    }
    // Only consider UPSTREAM selections so earlier steps stay browseable.
    // Filtering a step by a later step would silently hide options the user
    // already saw — confusing if they want to backtrack.
    function rangeFromState(forStepKey) {
        const idx = STEPS.indexOf(forStepKey);
        const ranges = [];
        for (let i = 0; i < idx; i++) {
            const s = STEPS[i];
            const v = state[s];
            if (!v) continue;
            const opt = getSource(s)[v];
            if (!opt) continue;
            ranges.push(RANGE_OF[s](opt));
        }
        return intersectRanges(ranges);
    }

    function isCompatibleOption(stepKey, optKey, opt) {
        // National-system check only on the downstream side: filter `town` by
        // `standard` (standard is upstream). Do NOT filter `standard` by `town`
        // — that would shrink an already-visible step on a later pick.
        if (stepKey === 'town' && state.standard) {
            const stdOpt = Object.assign({}, STANDARD[state.standard], { id: state.standard });
            if (!townMatchesStandard(opt, stdOpt)) return false;
        }
        const optR = (RANGE_OF[stepKey] || function () { return null; })(opt);
        if (!optR) return true;
        const baseR = rangeFromState(stepKey);
        if (baseR === null) return false;
        return intersect(baseR, optR) !== null;
    }

    // -- IMAGE HELPERS -----------------------------------------------------
    const IMG_EXTS = ['png', 'svg', 'jpg'];
    function tryLoadImage(wrap, paths, idx) {
        if (idx >= paths.length) return;
        const img = new Image();
        img.alt = '';
        img.onload = function () { wrap.innerHTML = ''; wrap.appendChild(img); };
        img.onerror = function () { tryLoadImage(wrap, paths, idx + 1); };
        img.src = paths[idx];
    }
    function buildLegacyImg(category, slug, glyph) {
        // Legacy slot: images/hallmarks/<category>-<slug>.{png,svg,jpg}
        const wrap = document.createElement('div');
        wrap.className = 'wiz-img';
        const fallback = document.createElement('span');
        fallback.className = 'wiz-glyph';
        fallback.textContent = glyph || '·';
        wrap.appendChild(fallback);
        const paths = IMG_EXTS.map(e => 'images/hallmarks/' + category + '-' + slug + '.' + e);
        tryLoadImage(wrap, paths, 0);
        return wrap;
    }
    function buildDirectImg(srcPath, fallbackText, className) {
        // For pre-built relative paths from data files, e.g. "frames/london/1697-1715.gif"
        const wrap = document.createElement('div');
        wrap.className = className || 'wiz-img';
        const fallback = document.createElement('span');
        fallback.className = 'wiz-glyph';
        fallback.textContent = fallbackText || '·';
        wrap.appendChild(fallback);
        if (srcPath) tryLoadImage(wrap, ['images/hallmarks/' + srcPath], 0);
        return wrap;
    }

    // -- LETTER STYLE HINT -------------------------------------------------
    // Lightweight description to help users match the visual style of a date letter
    // without needing per-cycle manual labelling. Reads year era + case.
    function letterStyleHint(letter, year, caseTag) {
        const c = caseTag === 'U' ? 'uppercase' : 'lowercase';
        const era = year < 1700 ? 'Old English / Black Letter'
            : year < 1800 ? 'Roman'
            : year < 1900 ? 'Roman or italic'
            : year < 1975 ? 'Roman or sans-serif'
            : 'modern serif';
        return `${era} ${c}`;
    }
    function cycleStyleHint(cycle) {
        if (!cycle.letters || cycle.letters.length === 0) return '';
        // Count case to decide cycle's dominant case
        const u = cycle.letters.filter(l => l.case === 'U').length;
        const l = cycle.letters.filter(l => l.case === 'L').length;
        const dominant = u >= l ? 'uppercase' : 'lowercase';
        const start = cycle.from;
        const era = start < 1700 ? 'Old English / Black Letter'
            : start < 1800 ? 'Roman'
            : start < 1900 ? 'Roman or italic'
            : start < 1975 ? 'Roman or sans-serif'
            : 'modern serif';
        return `${era}, ${dominant}`;
    }

    // -- CARD RENDERING -----------------------------------------------------
    function makeCard(category, id, opt) {
        const c = document.createElement('div');
        c.className = 'wiz-card';
        c.setAttribute('role', 'button');
        c.setAttribute('tabindex', '0');
        c.dataset.id = id;

        if (category === 'cycle') {
            // Cycle card: frame thumbnail + range + style hint + letter count
            c.appendChild(buildDirectImg(opt.frame, opt.key, 'wiz-cycle-frame'));
            const range = document.createElement('div');
            range.className = 'wiz-card-name';
            range.textContent = opt.from + (opt.to == null ? '–present' : '–' + opt.to);
            c.appendChild(range);
            const sub = document.createElement('div');
            sub.className = 'wiz-card-sub';
            sub.textContent = cycleStyleHint(opt) + ' · ' + opt.letters.length + ' letters';
            c.appendChild(sub);
        } else if (category === 'dateletter') {
            // Date letter card: glyph image + letter + year
            c.appendChild(buildDirectImg(opt.glyph, opt.letter, 'wiz-letter-img'));
            const letter = document.createElement('div');
            letter.className = 'wiz-letter';
            letter.textContent = opt.letter + (opt.case === 'L' ? ' (lowercase)' : '');
            c.appendChild(letter);
            const year = document.createElement('div');
            year.className = 'wiz-card-year';
            year.textContent = opt.year;
            c.appendChild(year);
            const hint = document.createElement('div');
            hint.className = 'wiz-card-cycle';
            hint.textContent = letterStyleHint(opt.letter, opt.year, opt.case);
            c.appendChild(hint);
        } else {
            c.appendChild(buildLegacyImg(category, id, opt.glyph));
            const name = document.createElement('div');
            name.className = 'wiz-card-name';
            name.textContent = opt.name;
            c.appendChild(name);
            if (opt.sub) {
                const sub = document.createElement('div');
                sub.className = 'wiz-card-sub';
                sub.textContent = opt.sub;
                c.appendChild(sub);
            }
        }
        const handle = function () { selectCard(category, id); };
        c.addEventListener('click', handle);
        c.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handle(); }
        });
        return c;
    }

    function renderCards(stepKey) {
        const host = document.querySelector('[data-cards="' + stepKey + '"]');
        if (!host) return;
        host.innerHTML = '';
        const source = stepKey === 'solid' ? SOLID : getSource(stepKey);
        const entries = Array.isArray(source)
            ? source
            : Object.entries(source).map(e => Object.assign({ id: e[0] }, e[1]));
        const filtered = (stepKey === 'solid')
            ? entries
            : entries.filter(opt => isCompatibleOption(stepKey, opt.id, opt));
        // Sort cycles chronologically; sort letters by year
        if (stepKey === 'cycle') filtered.sort((a, b) => a.from - b.from);
        if (stepKey === 'dateletter') filtered.sort((a, b) => a.year - b.year);
        filtered.forEach(opt => host.appendChild(makeCard(stepKey, opt.id, opt)));
        host.dataset.count = String(filtered.length);
        // Skip card for optional steps
        if (stepKey === 'duty' || stepKey === 'commemorative' || stepKey === 'cycle' || stepKey === 'dateletter') {
            const skip = document.createElement('div');
            skip.className = 'wiz-card';
            skip.setAttribute('role', 'button');
            skip.setAttribute('tabindex', '0');
            skip.dataset.id = '__skip__';
            const wrap = document.createElement('div');
            wrap.className = 'wiz-img';
            const span = document.createElement('span');
            span.className = 'wiz-glyph';
            span.textContent = '–';
            wrap.appendChild(span);
            skip.appendChild(wrap);
            const nm = document.createElement('div');
            nm.className = 'wiz-card-name';
            nm.textContent = 'Not present';
            skip.appendChild(nm);
            const sb = document.createElement('div');
            sb.className = 'wiz-card-sub';
            sb.textContent = stepKey === 'duty' ? 'No sovereign’s head'
                : stepKey === 'commemorative' ? 'No commemorative mark'
                : stepKey === 'cycle' ? 'Skip — go straight to letter'
                : 'Skip date letter';
            skip.appendChild(sb);
            const handler = function () { selectCard(stepKey, null); };
            skip.addEventListener('click', handler);
            skip.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
            });
            host.appendChild(skip);
        }
    }

    function selectCard(stepKey, id) {
        state[stepKey] = id;
        // Clear downstream selections that no longer fit
        const fromIdx = STEPS.indexOf(stepKey);
        if (fromIdx >= 0) {
            for (let i = fromIdx + 1; i < STEPS.length; i++) {
                const s = STEPS[i];
                if (state[s]) {
                    const opt = getSource(s)[state[s]];
                    if (!opt || !isCompatibleOption(s, state[s], opt)) state[s] = null;
                }
            }
        }
        // Re-render all downstream steps
        STEPS.forEach(s => { if (s !== stepKey) renderCards(s); });
        // Repaint selection on current step
        document.querySelectorAll('[data-cards="' + stepKey + '"] .wiz-card').forEach(el => {
            el.classList.toggle('selected', el.dataset.id === (id == null ? '__skip__' : id));
        });
        // Restore selection visuals on downstream steps too
        STEPS.forEach(s => {
            if (!state[s]) return;
            document.querySelectorAll('[data-cards="' + s + '"] .wiz-card').forEach(el => {
                el.classList.toggle('selected', el.dataset.id === state[s]);
            });
        });
        advance();
        render();
    }

    function setStepHidden(stepKey, hidden) {
        const el = document.querySelector('[data-step="' + stepKey + '"]');
        if (el) el.classList.toggle('is-hidden', !!hidden);
    }

    function advance() {
        if (state.solid === 'plated' || state.solid === 'unsure' || !state.solid) {
            STEPS.forEach(s => setStepHidden(s, true));
            return;
        }
        setStepHidden('standard', false);
        setStepHidden('town', !state.standard);
        ['duty','commemorative'].forEach(s => {
            if (!state.town) { setStepHidden(s, true); return; }
            const host = document.querySelector('[data-cards="' + s + '"]');
            const count = host ? parseInt(host.dataset.count || '0', 10) : 0;
            setStepHidden(s, count === 0);
        });
        // Cycle step: visible once town is picked AND cycle data has compatible cycles
        if (!state.town) {
            setStepHidden('cycle', true);
            setStepHidden('dateletter', true);
            return;
        }
        const cycHost = document.querySelector('[data-cards="cycle"]');
        const cycCount = cycHost ? parseInt(cycHost.dataset.count || '0', 10) : 0;
        setStepHidden('cycle', cycCount === 0);
        // Dateletter step: visible only when cycle is picked
        if (!state.cycle) {
            setStepHidden('dateletter', true);
        } else {
            const dlHost = document.querySelector('[data-cards="dateletter"]');
            const dlCount = dlHost ? parseInt(dlHost.dataset.count || '0', 10) : 0;
            setStepHidden('dateletter', dlCount === 0);
        }
    }

    function dl(term, defn) {
        const dt = document.createElement('dt');
        dt.textContent = term;
        const dd = document.createElement('dd');
        dd.textContent = defn;
        $details.appendChild(dt);
        $details.appendChild(dd);
    }

    const $verdict = document.getElementById('verdict');
    const $details = document.getElementById('details');
    const $caveats = document.getElementById('caveats');
    const fmt = n => n == null ? 'present' : String(n);

    function render() {
        $details.innerHTML = '';
        $caveats.innerHTML = '';

        if (state.solid === 'plated') {
            $verdict.innerHTML = '<strong>This is silver plate, not solid silver.</strong> Silver-plated items don’t carry UK assay marks. Look for EPNS, A1, Sheffield Plate, or "silver plate" wording.';
            $caveats.innerHTML = '<p>See the section <em>Silver plate vs solid silver</em> below for the full breakdown.</p>';
            return;
        }
        if (state.solid === 'unsure') {
            $verdict.innerHTML = 'Look for an assay mark (a small lion, anchor, or leopard’s head) versus a plate mark (EPNS, A1, "silver plate"). The section below explains the difference.';
            return;
        }
        if (!state.solid) {
            $verdict.textContent = 'Make selections in the wizard above to see your summary.';
            return;
        }
        if (!state.standard || !state.town) {
            $verdict.textContent = state.standard ? 'Now pick the town mark (Step 3).' : 'Now pick the standard mark (Step 2).';
            return;
        }

        const std = STANDARD[state.standard];
        const town = TOWN[state.town];
        const duty = state.duty ? DUTY[state.duty] : null;
        const com  = state.commemorative ? COMMEM[state.commemorative] : null;
        const cycleSrc = getSource('cycle');
        const cycle = state.cycle ? cycleSrc[state.cycle] : null;
        const letterSrc = getSource('dateletter');
        const letter = state.dateletter ? letterSrc[state.dateletter] : null;

        let range = intersect({ from: std.from, to: null }, { from: town.from, to: town.to });
        if (!range) {
            $verdict.innerHTML = '<strong>These marks don’t fit together.</strong> The standard mark and town mark you selected weren’t in use at the same time. Double-check the marks.';
            dl('Standard mark', std.name + ' — ' + std.purity + ', in use from ' + std.from + '.');
            dl('Town mark', town.name + ' — ' + town.office + ', in use ' + town.from + '–' + fmt(town.to) + '.');
            return;
        }
        if (duty) range = intersect(range, { from: duty.from, to: duty.to });
        if (com)  range = intersect(range, { from: com.from, to: com.to });
        if (cycle) range = intersect(range, { from: cycle.from, to: cycle.to });
        if (letter) range = intersect(range, { from: letter.year, to: letter.year });
        if (!range) {
            $verdict.innerHTML = '<strong>Combination doesn’t add up.</strong> The marks you picked aren’t consistent. Double-check the cycle and letter against your piece.';
            return;
        }

        const fromTxt = String(range.from);
        const toTxt = range.to == null ? 'present' : String(range.to);
        const dateClause = (range.from === range.to) ? fromTxt : (range.to == null ? 'after ' + fromTxt : fromTxt + '–' + toTxt);
        $verdict.innerHTML = 'This piece appears to be <strong>' + std.purity + '</strong>, assayed at <strong>' + town.office + '</strong>, ' + (range.from === range.to ? 'in <strong>' + dateClause + '</strong>.' : 'between <strong>' + dateClause + '</strong>.');

        dl('Standard mark', std.name + ' — ' + std.purity + ', ' + std.region + '. In use from ' + std.from + '.' + (std.note ? ' ' + std.note : ''));
        dl('Town mark', town.name + ' — ' + town.office + '. In use ' + town.from + '–' + fmt(town.to) + '.' + (town.note ? ' ' + town.note : ''));
        if (duty) dl('Duty mark', duty.monarch === 'unidentified' ? 'Sovereign’s head present (monarch unclear). Duty marks were applied 1784–1890.' : duty.monarch + ' profile, in use ' + duty.from + '–' + duty.to + '. Indicates duty was paid.');
        if (com)  dl('Commemorative', com.label + ' — applied ' + com.from + (com.from === com.to ? '' : '–' + com.to) + '. Voluntary mark.');
        if (cycle) dl('Date letter cycle', cycle.from + (cycle.to == null ? '–present' : '–' + cycle.to) + ' (' + cycleStyleHint(cycle) + '). Each cycle has its own font and shield shape.');
        if (letter) dl('Date letter', '“' + letter.letter + '” (' + (letter.case === 'U' ? 'uppercase' : 'lowercase') + ', ' + letterStyleHint(letter.letter, letter.year, letter.case) + ') = ' + letter.year + '.');

        const caveats = [];
        if (range.to == null || (range.to - range.from) >= 10) {
            if (state.cycle) {
                caveats.push('Pick the date letter that matches your piece in <strong>Step 7 above</strong> to pin down the exact year.');
            } else {
                caveats.push('Pick a <strong>date letter cycle</strong> (Step 6) to narrow further. Match the font and shield shape on your piece to one of the cycle thumbnails.');
            }
        }
        if (!duty && range.from < 1890 && (range.to == null || range.to >= 1784)) {
            caveats.push('If the piece dates between 1784 and 1890, it should also carry a sovereign’s head duty mark. Absence may mean it’s not from the UK or the mark has worn off.');
        }
        caveats.push('This tool reads marks; it does not <strong>authenticate</strong> them. For high-value pieces, have an Assay Office or auctioneer examine the piece.');
        caveats.push('Date letter images courtesy of <a href="https://www.silvermakersmarks.co.uk/" target="_blank" rel="noopener">silvermakersmarks.co.uk</a>.');
        $caveats.innerHTML = caveats.map(c => '<p>' + c + '</p>').join('');
    }

    // -- INIT ---------------------------------------------------------------
    async function loadCycles() {
        try {
            const res = await fetch('images/hallmarks/data/cycles.json');
            if (!res.ok) throw new Error('HTTP ' + res.status);
            CYCLES = await res.json();
        } catch (e) {
            console.warn('Failed to load cycles data:', e);
            CYCLES = {};
        }
    }

    function initRender() {
        renderCards('solid');
        STEPS.forEach(renderCards);
        render();
    }

    initRender();
    loadCycles().then(() => {
        // Re-render the dynamic steps now that data is available
        renderCards('cycle');
        renderCards('dateletter');
        advance();
        render();
    });
})();
