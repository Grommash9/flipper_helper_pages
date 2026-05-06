#!/usr/bin/env node
// Builds /tools/silver-hallmarks-{city}.html pages from tools/cities-data.json.
// Inlines the full date-letter chart per office, sourced from
// tools/images/hallmarks/data/<office>.json (built by tools/scrape-silvermakersmarks.js).
// To extend: edit the JSON, then run:
//   node build-cities-pages.js

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'tools', 'cities-data.json');
const OUT_DIR = path.join(ROOT, 'tools');
const CYCLES_DIR = path.join(ROOT, 'tools', 'images', 'hallmarks', 'data');
const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));

const esc = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function metaDesc(c) {
    const s = `${c.name} silver hallmarks: the ${c.mark_name.toLowerCase()} town mark, history from ${c.active_from}, full date letter chart, and how to read your piece.`;
    if (s.length > 155) return s.slice(0, 152) + '…';
    return s;
}

function siblingLinks(currentSlug) {
    return data.cities.filter(c => c.slug !== currentSlug).map(c =>
        `                        <a class="city-link" href="silver-hallmarks-${c.slug}.html">${esc(c.name)} <small>${esc(c.mark_name)}</small></a>`
    ).join('\n');
}

function loadOfficeCycles(slug) {
    const p = path.join(CYCLES_DIR, `${slug}.json`);
    if (!fs.existsSync(p)) return null;
    try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
    catch { return null; }
}

function dateLetterChartHTML(officeData, cityName) {
    if (!officeData || !officeData.cycles || !officeData.cycles.length) return '';

    // Flatten cycles into per-(letter, case) buckets, each entry with cycle range
    const buckets = new Map(); // 'G-U' → { letter, case, entries: [{year, glyph, cycleFrom, cycleTo}, ...] }
    for (const cycle of officeData.cycles) {
        for (const l of cycle.letters) {
            const key = `${l.letter}-${l.case}`;
            if (!buckets.has(key)) {
                buckets.set(key, { letter: l.letter, case: l.case, entries: [] });
            }
            buckets.get(key).entries.push({
                year: l.year,
                glyph: l.glyph,
                cycleFrom: cycle.from,
                cycleTo: cycle.to,
            });
        }
    }
    // Sort entries within each bucket by year ascending
    for (const b of buckets.values()) b.entries.sort((a, b) => a.year - b.year);

    const present = (caseTag) => [...buckets.values()].some(b => b.case === caseTag);
    const sortedKeys = (caseTag) => [...buckets.values()]
        .filter(b => b.case === caseTag)
        .sort((a, b) => a.letter.localeCompare(b.letter));

    function pickerRow(caseTag, label) {
        if (!present(caseTag)) return '';
        const buttons = sortedKeys(caseTag).map(b => {
            const k = `${b.letter}-${b.case}`;
            const display = caseTag === 'U' ? b.letter : b.letter.toLowerCase();
            return `<button class="letter-pick" data-pick="${esc(k)}">${esc(display)}<span class="letter-pick-count">${b.entries.length}</span></button>`;
        }).join('');
        return `
                        <div class="letter-picker-row">
                            <span class="letter-picker-label">${label}</span>
                            <div class="letter-picker-buttons">${buttons}</div>
                        </div>`;
    }

    function bucketBlock(b) {
        const k = `${b.letter}-${b.case}`;
        const headingCase = b.case === 'U' ? 'uppercase' : 'lowercase';
        const display = b.case === 'U' ? b.letter : b.letter.toLowerCase();
        const cards = b.entries.map(e => {
            const cycleLabel = e.cycleTo == null ? `${e.cycleFrom}–present` : (e.cycleFrom === e.cycleTo ? `${e.cycleFrom}` : `${e.cycleFrom}–${e.cycleTo}`);
            return `
                            <div class="letter-card">
                                <div class="letter-card-img"><img src="images/hallmarks/${esc(e.glyph)}" alt="${esc(cityName)} ${esc(e.year)} date letter ${esc(b.letter)}" loading="lazy"></div>
                                <div class="letter-card-year">${e.year}</div>
                                <div class="letter-card-cycle">cycle ${cycleLabel}</div>
                            </div>`;
        }).join('');
        // Hidden by default — picker reveals one bucket at a time.
        return `
                    <div class="letter-bucket is-hidden" data-letter="${esc(k)}">
                        <h3 class="letter-bucket-heading">${esc(display)} <small>${headingCase} · ${b.entries.length} year${b.entries.length === 1 ? '' : 's'}</small></h3>
                        <div class="letter-cards">${cards}
                        </div>
                    </div>`;
    }

    const orderedBuckets = [
        ...sortedKeys('U'),
        ...sortedKeys('L'),
    ];
    const blocks = orderedBuckets.map(bucketBlock).join('');

    const totalEntries = orderedBuckets.reduce((n, b) => n + b.entries.length, 0);
    const defaultStatus = `Pick a letter above to see the years ${cityName} used it (${totalEntries} year-letter pairs across ${orderedBuckets.length} letters).`;

    return `
                <section id="date-letter-chart">
                    <h2>${esc(cityName)} date letter — pick the letter on your piece</h2>
                    <p>Click the letter stamped on your piece. The chart below shows every year ${esc(cityName)} used that letter, with the actual glyph image alongside — match the font and shield shape to narrow to one year.</p>
                    <div class="letter-picker">${pickerRow('U', 'UPPERCASE')}${pickerRow('L', 'lowercase')}
                        <div class="letter-picker-actions">
                            <button class="letter-pick-clear" type="button">Clear</button>
                            <span class="letter-picker-status" data-default-text="${esc(defaultStatus)}">${esc(defaultStatus)}</span>
                        </div>
                    </div>
                    <p class="callout"><strong>Source:</strong> date letter glyphs are sourced from <a href="https://www.silvermakersmarks.co.uk/" target="_blank" rel="noopener">silvermakersmarks.co.uk</a> with permission. For makers' mark identification (out of scope here), use that site directly.</p>
                    <div class="letter-buckets">${blocks}
                    </div>
                </section>`;
}

function pageHTML(c) {
    const url = `https://flipperhelper.app/tools/silver-hallmarks-${c.slug}.html`;
    const title = `${c.name} Silver Hallmarks — ${c.mark_name.split(' (')[0]} | FlipperHelper`;
    const desc = metaDesc(c);
    const officeData = loadOfficeCycles(c.slug);
    const cycleCount = officeData ? officeData.cycles.length : 0;
    const letterCount = officeData ? officeData.cycles.reduce((n, cy) => n + cy.letters.length, 0) : 0;
    const breadcrumbs = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://flipperhelper.app/' },
            { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://flipperhelper.app/tools/' },
            { '@type': 'ListItem', position: 3, name: 'UK Silver Hallmarks', item: 'https://flipperhelper.app/tools/uk-silver-hallmarks.html' },
            { '@type': 'ListItem', position: 4, name: `${c.name} hallmarks`, item: url }
        ]
    };
    const article = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `${c.name} silver hallmarks: ${c.mark_name}`,
        description: desc,
        author: { '@type': 'Person', name: 'Oleksandr Prudnikov' },
        datePublished: data._last_verified,
        dateModified: data._last_verified,
        mainEntityOfPage: url
    };
    const faq = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: `What is the ${c.name} silver hallmark?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `The ${c.name} town mark is the ${c.mark_name}. ${c.mark_blurb} The ${c.name} Assay Office has been operating since ${c.active_from} and is still active today.`
                }
            },
            {
                '@type': 'Question',
                name: `How do I find the year a ${c.name} silver piece was made?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Identify the date letter on your piece — a single letter inside a shaped shield. The combination of the letter, its case (upper or lower), the font, and the shield shape identifies a specific year within a specific cycle. This page lists every ${c.name} cycle from ${officeData?.cycles[0]?.from || c.active_from} to the present, with the actual glyph image for every year. Match what's stamped on your piece to the chart on this page.`
                }
            },
            {
                '@type': 'Question',
                name: `Where is the ${c.name} Assay Office today?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `${c.office_url_label} is still active. Their official website is ${c.office_url}.`
                }
            },
            {
                '@type': 'Question',
                name: `Are the four UK Assay Offices' date letters the same?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `From 1975 onwards, yes — London, Birmingham, Sheffield and Edinburgh share the same date-letter sequence under the Hallmarking Act 1973. Before 1975, each office ran its own independent cycle. So a piece from 1975 onwards uses the same letter regardless of the office; an older piece uses an office-specific letter.`
                }
            }
        ]
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(title).slice(0, 70)}</title>
    <meta name="description" content="${esc(desc)}">
    <link rel="icon" type="image/svg+xml" href="../logo_FH.svg">
    <link rel="stylesheet" href="../styles.css">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${esc(c.name)} silver hallmarks — ${esc(c.mark_name)}">
    <meta property="og:description" content="${esc(desc)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="https://flipperhelper.app/logo_FH.png">
    <meta property="og:site_name" content="FlipperHelper">
    <meta property="og:locale" content="en_GB">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${esc(c.name)} Silver Hallmarks">
    <meta name="twitter:description" content="${esc(desc)}">
    <script type="application/ld+json">${JSON.stringify(breadcrumbs, null, 2)}</script>
    <script type="application/ld+json">${JSON.stringify(article, null, 2)}</script>
    <script type="application/ld+json">${JSON.stringify(faq, null, 2)}</script>
    <style>
        .callout {
            background: var(--bg-secondary);
            border: 1px solid var(--border-subtle);
            border-left: 3px solid var(--color-primary);
            padding: 0.85rem 1rem;
            margin: 0.9rem 0;
            color: var(--text-secondary);
            border-radius: var(--radius-sm);
        }
        .callout strong, .callout em, .callout b { color: var(--text-primary); }
        .callout a { color: var(--color-primary-text); }
        .mark-hero {
            display: flex;
            gap: 1.25rem;
            align-items: center;
            background: var(--bg-secondary);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-md);
            padding: 1.25rem;
            margin: 1.5rem 0;
        }
        .mark-hero .mark-img {
            width: 100px;
            height: 100px;
            min-width: 100px;
            background: #f4ead6;
            border-radius: var(--radius-sm);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6a4a1a;
            font-weight: 600;
            font-size: 0.85rem;
            text-align: center;
            padding: 0.5rem;
        }
        .mark-hero .mark-img img { max-width: 100%; max-height: 100%; }
        .mark-hero h2 { margin: 0 0 0.4rem 0; color: var(--text-primary); }
        .mark-hero p { margin: 0; color: var(--text-secondary); }
        .mark-hero p strong { color: var(--text-primary); }
        .city-link-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 0.6rem;
            margin: 1rem 0;
        }
        .city-link {
            background: var(--bg-card);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-sm);
            padding: 0.85rem 1rem;
            text-decoration: none;
            color: var(--text-primary);
            font-weight: 600;
            transition: border-color var(--transition-fast), background var(--transition-fast);
        }
        .city-link:hover {
            background: var(--bg-card-hover);
            border-color: var(--border-hover);
        }
        .city-link small {
            display: block;
            font-weight: normal;
            color: var(--text-tertiary);
            margin-top: 0.2rem;
            font-size: 0.82rem;
        }
        /* Date-letter chart — letter picker + buckets */
        .letter-picker {
            background: var(--bg-secondary);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-md);
            padding: 1rem;
            margin: 1.25rem 0 0.75rem 0;
            position: sticky;
            top: 0;
            z-index: 5;
        }
        .letter-picker-row {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.5rem;
            flex-wrap: wrap;
        }
        .letter-picker-row:last-of-type { margin-bottom: 0; }
        .letter-picker-label {
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            color: var(--text-tertiary);
            min-width: 78px;
        }
        .letter-picker-buttons {
            display: flex;
            gap: 0.3rem;
            flex-wrap: wrap;
            flex: 1;
        }
        .letter-pick {
            background: var(--bg-card);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-sm);
            color: var(--text-primary);
            font-family: 'Georgia', serif;
            font-weight: 700;
            font-size: 1.1rem;
            line-height: 1;
            padding: 0.45rem 0.6rem;
            cursor: pointer;
            transition: border-color var(--transition-fast), background var(--transition-fast);
            display: inline-flex;
            align-items: baseline;
            gap: 0.25rem;
            min-width: 38px;
            justify-content: center;
        }
        .letter-pick:hover {
            background: var(--bg-card-hover);
            border-color: var(--border-hover);
        }
        .letter-pick.is-active {
            background: var(--color-primary-light);
            border-color: var(--color-primary);
            color: var(--color-primary-text);
        }
        .letter-pick-count {
            font-family: var(--font-sans);
            font-size: 0.65rem;
            font-weight: 500;
            color: var(--text-tertiary);
        }
        .letter-pick.is-active .letter-pick-count { color: var(--color-primary-text); }
        .letter-picker-actions {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-top: 0.85rem;
            padding-top: 0.75rem;
            border-top: 1px solid var(--border-subtle);
            flex-wrap: wrap;
        }
        .letter-pick-clear {
            background: transparent;
            border: 1px solid var(--border-default);
            border-radius: var(--radius-sm);
            color: var(--text-secondary);
            font-size: 0.85rem;
            padding: 0.4rem 0.85rem;
            cursor: pointer;
            transition: border-color var(--transition-fast), color var(--transition-fast);
        }
        .letter-pick-clear:hover {
            color: var(--text-primary);
            border-color: var(--border-hover);
        }
        .letter-picker-status {
            color: var(--text-tertiary);
            font-size: 0.85rem;
        }
        .letter-bucket {
            background: var(--bg-secondary);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-md);
            padding: 1rem;
            margin: 0.75rem 0;
        }
        .letter-bucket.is-hidden { display: none; }
        .letter-bucket-heading {
            margin: 0 0 0.75rem 0;
            font-size: 1.5rem;
            font-family: 'Georgia', serif;
            color: var(--text-primary);
            display: flex;
            align-items: baseline;
            gap: 0.6rem;
        }
        .letter-bucket-heading small {
            font-family: var(--font-sans);
            font-size: 0.78rem;
            font-weight: 400;
            color: var(--text-tertiary);
        }
        .letter-cards {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
            gap: 0.5rem;
        }
        .letter-card {
            background: var(--bg-card);
            border: 1px solid var(--border-default);
            border-radius: var(--radius-sm);
            padding: 0.55rem 0.4rem;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.3rem;
        }
        .letter-card-img {
            width: 60px;
            height: 60px;
            background: #f4ead6;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .letter-card-img img {
            max-width: 100%;
            max-height: 100%;
            image-rendering: -webkit-optimize-contrast;
        }
        .letter-card-year {
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--text-primary);
            line-height: 1;
        }
        .letter-card-cycle {
            font-size: 0.68rem;
            color: var(--text-tertiary);
            line-height: 1.2;
        }
    </style>
</head>
<body>
    <nav class="nav">
        <div class="nav-container">
            <a href="/" class="nav-logo">
                <img src="../logo_FH.svg" alt="FlipperHelper" class="nav-logo-img">
                <span>FlipperHelper</span>
            </a>
            <div class="nav-links">
                <a href="/">Home</a>
                <a href="../blog/">Blog</a>
                <a href="../faq.html">FAQ</a>
            </div>
        </div>
    </nav>

    <main class="legal-page">
        <div class="container">
            <article class="legal-content">
                <h1>${esc(c.name)} Silver Hallmarks</h1>
                <p class="legal-updated">Last verified: ${data._last_verified}</p>

                <p><a href="uk-silver-hallmarks.html">&larr; Back to the UK Silver Hallmarks Identifier</a></p>

                <div class="mark-hero">
                    <div class="mark-img" id="hero-img" data-slug="${esc(c.slug)}">
                        <span>${esc(c.mark_name.split(' (')[0])}</span>
                    </div>
                    <div>
                        <h2>${esc(c.mark_name)}</h2>
                        <p>${esc(c.mark_blurb)}</p>
                        <p style="margin-top:0.5rem;font-size:0.92rem;">In use since <strong>${c.active_from}</strong> &middot; ${c.active_to ? 'Closed ' + c.active_to : 'Still active'} &middot; ${esc(c.country)}${cycleCount ? ` &middot; <strong>${cycleCount}</strong> cycles, <strong>${letterCount}</strong> dated letters on this page` : ''}</p>
                    </div>
                </div>

                <section>
                    <h2>History</h2>
                    <p>${esc(c.narrative_history)}</p>
                </section>

                <section>
                    <h2>Reading the marks on a ${esc(c.name)} piece</h2>
                    <p>${esc(c.narrative_marks)}</p>
                </section>

                <section>
                    <h2>Identifying the date — using the date letter</h2>
                    <p>${esc(c.narrative_dating)}</p>
                    <p class="callout">
                        <strong>Faster:</strong> the <a href="uk-silver-hallmarks.html#wiz">main UK Silver Hallmarks Identifier</a> walks you through standard mark, town mark, cycle, and letter step-by-step and prints the year. Use the chart further down this page if you prefer to scan visually.
                    </p>
                </section>
${dateLetterChartHTML(officeData, c.name)}

                <section>
                    <h2>The other UK Assay Offices</h2>
                    <p>If your piece&rsquo;s town mark doesn&rsquo;t match the ${esc(c.mark_name)}, try one of the other active offices:</p>
                    <div class="city-link-grid">
${siblingLinks(c.slug)}
                    </div>
                    <p>For closed historical offices &mdash; Chester, Newcastle, Exeter, York, Glasgow &mdash; and Dublin, see the <a href="uk-silver-hallmarks.html#wiz">main identifier</a>; full per-office cycle data is wired into the wizard for those too.</p>
                </section>

                <section>
                    <h2>Related</h2>
                    <ul>
                        <li><a href="uk-silver-hallmarks.html">Main UK Silver Hallmarks Identifier</a> (multi-office wizard)</li>
                        <li>Official site: <a href="${esc(c.office_url)}" target="_blank" rel="noopener">${esc(c.office_url_label)}</a></li>
                        <li><a href="https://www.thegoldsmiths.co.uk/" target="_blank" rel="noopener">Goldsmiths&rsquo; Company</a> &mdash; the compulsory hallmarking authority for England and Wales</li>
                        <li><a href="https://www.silvermakersmarks.co.uk/" target="_blank" rel="noopener">silvermakersmarks.co.uk</a> &mdash; the most thorough open reference for British &amp; Irish makers&rsquo; marks (out of scope on this site).</li>
                    </ul>
                </section>

                <section>
                    <h2>Track silver flips with FlipperHelper</h2>
                    <p>FlipperHelper logs each piece with photos, tracks listings across eBay, Vinted, and 14 other platforms, and shows real profit per item after every expense. Free on the App Store.</p>
                    <p style="text-align:center; margin-top:1.5em;">
                        <a href="https://apps.apple.com/us/app/flipperhelper/id6759716745" class="btn btn-primary" target="_blank" rel="noopener">Download FlipperHelper Free on the App Store</a>
                    </p>
                </section>
            </article>
        </div>
    </main>

    <footer class="footer footer-compact">
        <div class="container">
            <div class="footer-row">
                <p>&copy; 2025&ndash;2026 Oleksandr Prudnikov</p>
                <div class="footer-links-inline">
                    <a href="https://www.instagram.com/flipperhelper" target="_blank" rel="noopener">Instagram</a>
                    <a href="https://www.reddit.com/r/flipperhelper/" target="_blank" rel="noopener">Reddit</a>
                    <a href="../privacy.html">Privacy</a>
                    <a href="../terms.html">Terms</a>
                    <a href="mailto:andreevichprudnikov@gmail.com">Contact</a>
                </div>
            </div>
        </div>
    </footer>

    <script>
    // Auto-load office mark image if present at /tools/images/hallmarks/town-<slug>.{png,svg,jpg}
    (function () {
        const heroEl = document.getElementById('hero-img');
        if (!heroEl) return;
        const slug = heroEl.dataset.slug;
        const imageSlugMap = {
            'london': 'leopard-uncrowned',
            'birmingham': 'anchor',
            'sheffield': 'rose-sheffield',
            'edinburgh': 'castle-edinburgh'
        };
        const imageSlug = imageSlugMap[slug];
        if (!imageSlug) return;
        const exts = ['png', 'svg', 'jpg'];
        function tryLoad(idx) {
            if (idx >= exts.length) return;
            const img = new Image();
            img.alt = '';
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.onload = function () { heroEl.innerHTML = ''; heroEl.appendChild(img); };
            img.onerror = function () { tryLoad(idx + 1); };
            img.src = 'images/hallmarks/town-' + imageSlug + '.' + exts[idx];
        }
        tryLoad(0);
    })();
    </script>
    <script>
    // Date-letter picker — click a letter, hide buckets that don't match.
    (function () {
        const picker = document.querySelector('.letter-picker');
        if (!picker) return;
        const status = picker.querySelector('.letter-picker-status');
        const defaultStatus = status ? status.dataset.defaultText : '';
        const buckets = document.querySelectorAll('.letter-bucket');
        const buttons = picker.querySelectorAll('.letter-pick');
        const clearBtn = picker.querySelector('.letter-pick-clear');

        function clear() {
            buckets.forEach(b => b.classList.remove('is-hidden'));
            buttons.forEach(b => b.classList.remove('is-active'));
            if (status) status.textContent = defaultStatus;
        }
        function pick(key, btn) {
            buttons.forEach(b => b.classList.toggle('is-active', b === btn));
            let visibleCount = 0;
            buckets.forEach(b => {
                const match = b.dataset.letter === key;
                b.classList.toggle('is-hidden', !match);
                if (match) visibleCount = b.querySelectorAll('.letter-card').length;
            });
            if (status) {
                const display = btn.firstChild ? btn.firstChild.textContent : key;
                status.textContent = 'Showing ' + visibleCount + ' year' + (visibleCount === 1 ? '' : 's') + ' for letter "' + display + '".';
            }
            // No scroll — the picker is sticky at top and the just-revealed
            // bucket is positioned directly below it. Auto-scroll was hiding
            // the picker behind the sticky overlap.
        }
        buttons.forEach(btn => btn.addEventListener('click', () => pick(btn.dataset.pick, btn)));
        if (clearBtn) clearBtn.addEventListener('click', clear);
    })();
    </script>
    <script data-goatcounter="https://grommash9.goatcounter.com/count"
            async src="//gc.zgo.at/count.js"></script>
</body>
</html>
`;
}

let written = 0;
for (const c of data.cities) {
    const out = path.join(OUT_DIR, `silver-hallmarks-${c.slug}.html`);
    fs.writeFileSync(out, pageHTML(c));
    written++;
}
console.log(`Wrote ${written} city pages to ${OUT_DIR}`);
