#!/usr/bin/env node
// Builds /tools/silver-hallmarks-{city}.html pages from tools/cities-data.json.
// Inlines the full date-letter chart per office, sourced from
// tools/images/hallmarks/data/<office>.json.
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

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

// The site writes dates as "6 May 2026" (design guide §14.1 — British English).
function ukDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return `${d} ${MONTHS[m - 1]} ${y}`;
}

// "a London piece" but "an Edinburgh piece"
const indefArticle = (name) => (/^[AEIOU]/i.test(name) ? 'an' : 'a');

function metaDesc(c) {
    const s = `${c.name} silver hallmarks: the ${c.mark_name.toLowerCase()} town mark, history from ${c.active_from}, full date letter chart, and how to read your piece.`;
    if (s.length > 155) return s.slice(0, 152) + '…';
    return s;
}

function siblingLinks(currentSlug) {
    return data.cities.filter(c => c.slug !== currentSlug).map(c =>
        `        <a class="city-link" href="silver-hallmarks-${c.slug}.html">${esc(c.name)} <small>${esc(c.mark_name)}</small></a>`
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
            return `<button type="button" class="letter-pick" data-pick="${esc(k)}" aria-pressed="false">${esc(display)}<span class="letter-pick-count">${b.entries.length}</span></button>`;
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
            <h3 class="letter-bucket-heading"><span class="letter-bucket-glyph">${esc(display)}</span> <small>${headingCase} · ${b.entries.length} year${b.entries.length === 1 ? '' : 's'}</small></h3>
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

    // The dividers belong to the chart: an office with no cycle data drops the whole
    // block, and two adjacent .tear rules would leave a doubled divider behind.
    return `
  <div class="wrap"><hr class="tear"></div>

  <section id="date-letter-chart" aria-labelledby="chart-title">
    <div class="wrap">
      <span class="eyebrow">Date letters</span>
      <h2 class="section-title" id="chart-title">${esc(cityName)} date letter &mdash; pick the letter on your piece</h2>
      <div class="prose">
        <p>Click the letter stamped on your piece. The chart below shows every year ${esc(cityName)} used that letter, with the actual glyph image alongside &mdash; match the font and shield shape to narrow it to one year.</p>
      </div>
      <div class="letter-picker">${pickerRow('U', 'Uppercase')}${pickerRow('L', 'Lowercase')}
        <div class="letter-picker-actions">
          <button class="btn-action letter-pick-clear" type="button">Clear</button>
          <span class="letter-picker-status" data-default-text="${esc(defaultStatus)}">${esc(defaultStatus)}</span>
        </div>
      </div>
      <div class="letter-buckets">${blocks}
      </div>
    </div>
  </section>

  <div class="wrap"><hr class="tear"></div>`;
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
                    text: c.office_url
                        ? `${c.office_url_label} is still active. Their official website is ${c.office_url}.`
                        : `${c.office_url_label} is still active.`
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
    <meta name="apple-itunes-app" content="app-id=6759716745">
    <meta name="color-scheme" content="light">
    <title>${esc(title).slice(0, 70)}</title>
    <meta name="description" content="${esc(desc)}">
    <link rel="icon" type="image/svg+xml" href="../logo_FH.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,400;8..144,500;8..144,600;8..144,700;8..144,800&amp;family=Roboto+Mono:wght@400;500;600&amp;display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/landing.css">
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
    <meta name="twitter:image" content="https://flipperhelper.app/logo_FH.png">
    <script type="application/ld+json">${JSON.stringify(breadcrumbs, null, 2)}</script>
    <script type="application/ld+json">${JSON.stringify(article, null, 2)}</script>
    <script type="application/ld+json">${JSON.stringify(faq, null, 2)}</script>
    <style>
/* ---- page-specific: everything else comes from /landing.css ---- */

/* skip link — not in landing.css yet; sits above the sticky nav (z-index:100) */
.skip{
  position:absolute;left:-9999px;top:0;z-index:200;
  font-family:var(--font-body);font-weight:600;font-size:var(--fs-xs);
  background:var(--card);color:var(--ink);border:1px solid var(--line-strong);
  border-radius:12px;padding:10px 16px;box-shadow:var(--neu-soft);
}
.skip:focus{left:24px;top:8px;text-decoration:none}

/* page head — title + meta line, same as the UK identifier page (§25.2) */
.page-head{padding:64px 0 0}
@media(max-width:720px){.page-head{padding:44px 0 0}}
.page-head h1{font-size:clamp(2rem,4.4vw,2.8rem);font-weight:800;letter-spacing:-.02em;margin-bottom:12px;max-width:820px}
.head-updated{font-family:var(--font-mono);font-size:var(--fs-2xs);color:var(--ink-45);font-variant-numeric:tabular-nums}
.backlink{display:inline-block;margin-top:14px;font-family:var(--font-mono);font-size:var(--fs-2xs);letter-spacing:.08em}

/* Body text takes the full 1080px frame rather than the style guide's 900px text
   measure (§5.2), the way uk-silver-hallmarks.html does, so every section on this
   page shares one left and right edge with the rest of the site. */
.prose p{margin-bottom:16px}
.prose p:last-child{margin-bottom:0}
.section-title{margin-bottom:20px}

/* the site's prose bullet: 6px periwinkle dot, bold term then the detail (§13.5) */
.answers{list-style:none}
.answers li{position:relative;padding-left:22px;margin-bottom:9px;color:var(--ink-66)}
.answers li:last-child{margin-bottom:0}
.answers li::before{content:"";position:absolute;left:4px;top:.58em;width:6px;height:6px;border-radius:50%;background:var(--cat)}

/* scope notes — .story .rule from landing.css, at body size (§25.5) */
.callout{border-left:3px solid var(--accent);padding:4px 0 4px 18px;margin:22px 0 0;color:var(--ink-66)}
.callout strong{color:var(--ink);font-weight:600}

/* the parchment plate a hallmark punch is photographed against — a literal, not a
   token (§2.3); scoped to the three blocks that show punch images */
.mark-hero,.letter-card-img,.img-lightbox{--plate:#F4EAD6;--plate-ink:#6A4A1A}

/* ---------- the town mark: this page's one emphasis card (§6.3) ---------- */
/* Tighter than the 68/48px section rhythm: the card continues the page head rather
   than opening a new idea, and the guide sanctions a reduced section padding in
   exactly that case (§5.6). Same idiom landing.css uses for section#get. */
section#town-mark{padding:38px 0}
@media(max-width:720px){section#town-mark{padding:26px 0}}
.mark-hero{
  display:flex;gap:22px;align-items:center;flex-wrap:wrap;
  background:var(--card);border:1px solid var(--line);border-radius:var(--radius-md);
  padding:26px 22px;box-shadow:var(--neu);position:relative;overflow:hidden;
}
.mark-hero::before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--accent);border-radius:4px 0 0 4px}
.mark-hero .mark-img{
  width:100px;height:100px;min-width:100px;background:var(--plate);border-radius:var(--radius-sm);
  display:flex;align-items:center;justify-content:center;text-align:center;padding:8px;
  font-family:var(--font-mono);font-weight:600;font-size:var(--fs-3xs);
  text-transform:uppercase;letter-spacing:.06em;line-height:1.3;color:var(--plate-ink);
}
.mark-hero .mark-img img{max-width:100%;max-height:100%}
.mark-hero-text{flex:1;min-width:240px}
/* card-level H2 — the guide's .featured h2 / .post-cta h2 size, not a page-level one */
.mark-hero h2{font-size:var(--fs-h3-lg);margin-bottom:8px;letter-spacing:-.01em}
.mark-hero p{color:var(--ink-66)}
.mark-hero .mark-meta{
  display:flex;flex-wrap:wrap;gap:6px 18px;margin-top:18px;padding-top:18px;
  border-top:1px dashed var(--line-strong);
  font-family:var(--font-mono);font-size:var(--fs-2xs);font-weight:500;letter-spacing:.06em;
  text-transform:uppercase;color:var(--ink-45);font-variant-numeric:tabular-nums;
}
.mark-hero .mark-meta b{color:var(--ink);font-weight:600}

/* ---------- small ghost control, same recipe as the UK identifier page ---------- */
.btn-action{
  font-family:var(--font-body);font-weight:600;font-size:var(--fs-xs);
  background:var(--card);color:var(--ink);border:1px solid var(--line-strong);border-radius:9px;
  padding:8px 14px;cursor:pointer;box-shadow:var(--neu-soft);
  transition:transform .15s ease,border-color .15s ease,color .15s ease;
}
.btn-action:hover{border-color:var(--action);color:var(--action)}
.btn-action:active{transform:translateY(1px)}

/* ---------- date-letter picker ---------- */
/* Not sticky, unlike the pre-redesign version: only one bucket is ever open, so the
   cards never run more than two rows and the picker stays on screen anyway. Sticking
   it would have meant hard-coding the nav's height, which differs above and below the
   860px breakpoint where landing.css drops the nav text links. */
.letter-picker{
  background:var(--card);border:1px solid var(--line);border-radius:var(--radius-lg);
  padding:22px;box-shadow:var(--neu-soft);
}
.letter-picker-row{display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-bottom:12px}
.letter-picker-row:last-of-type{margin-bottom:0}
.letter-picker-label{
  font-family:var(--font-mono);font-size:var(--fs-3xs);font-weight:600;
  letter-spacing:.14em;text-transform:uppercase;color:var(--ink-45);min-width:82px;
}
.letter-picker-buttons{display:flex;gap:8px;flex-wrap:wrap;flex:1}
/* VARIATION of .filters button (§6.4): same interactive-pill semantics — blue when
   selected, periwinkle never — but a 12px control radius instead of 999px, because
   the label is a single glyph the reader compares against a punch. It has to read
   as type, not as a tag. */
.letter-pick{
  display:inline-flex;align-items:baseline;justify-content:center;gap:5px;min-width:40px;
  background:var(--card);border:1px solid var(--line-strong);border-radius:12px;
  padding:6px 10px;cursor:pointer;box-shadow:var(--neu-soft);
  font-family:var(--font-mono);font-weight:600;font-size:var(--fs-base);line-height:1.2;color:var(--ink);
  transition:transform .15s ease,border-color .15s ease,color .15s ease,background .15s ease;
}
.letter-pick:hover{border-color:var(--action);color:var(--action)}
.letter-pick:active{transform:translateY(1px)}
.letter-pick[aria-pressed="true"]{border-color:var(--action);color:var(--action);background:rgba(30,118,241,.07);box-shadow:none}
.letter-pick-count{font-size:var(--fs-3xs);font-weight:400;color:var(--ink-45)}
.letter-pick[aria-pressed="true"] .letter-pick-count{color:var(--action)}
.letter-picker-actions{
  display:flex;align-items:center;gap:18px;flex-wrap:wrap;
  margin-top:18px;padding-top:18px;border-top:1px dashed var(--line-strong);
}
.letter-picker-status{font-size:var(--fs-sm);color:var(--ink-66)}

/* ---------- one bucket per letter, revealed by the picker ---------- */
.letter-buckets{margin-top:18px}
.letter-bucket{
  background:var(--card);border:1px solid var(--line);border-radius:var(--radius-md);
  padding:22px;box-shadow:var(--neu-soft);
}
.letter-bucket.is-hidden{display:none}
.letter-bucket-heading{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:18px}
.letter-bucket-glyph{font-family:var(--font-mono);font-size:var(--fs-h3-lg);font-weight:600}
.letter-bucket-heading small{
  font-family:var(--font-mono);font-size:var(--fs-2xs);font-weight:400;
  letter-spacing:.08em;color:var(--ink-45);
}
.letter-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:12px}
/* inset tiles inside the bucket card — no shadow of their own; the card carries it,
   and at a 12px gap two shadowed tiles would bleed into each other anyway (§7.2) */
.letter-card{
  position:relative;background:var(--bg);border:1px solid var(--line-strong);border-radius:var(--radius-md);
  padding:12px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;
}
.letter-card-img{
  width:60px;height:60px;background:var(--plate);border-radius:var(--radius-sm);
  display:flex;align-items:center;justify-content:center;
}
.letter-card-img img{max-width:100%;max-height:100%;image-rendering:-webkit-optimize-contrast}
.letter-card-year{
  font-family:var(--font-mono);font-size:var(--fs-sm);font-weight:600;color:var(--ink);
  line-height:1.2;font-variant-numeric:tabular-nums;
}
.letter-card-cycle{font-family:var(--font-mono);font-size:var(--fs-3xs);color:var(--ink-45);line-height:1.3}

.zoom-btn{
  position:absolute;top:5px;right:5px;width:22px;height:22px;
  background:rgba(0,0,0,.5);color:#fff;border:0;border-radius:50%;cursor:pointer;
  font-size:13px;line-height:1;display:flex;align-items:center;justify-content:center;
  opacity:.5;transition:opacity .15s ease,background .15s ease;padding:0;z-index:2;
}
.zoom-btn:hover{opacity:1;background:rgba(0,0,0,.8)}

/* ---------- the sibling office pages ---------- */
/* There are always exactly three siblings, so name three columns rather than letting
   auto-fill pack them — the row then spans the full 1032px frame like the rest of the
   page. Collapses straight to one column, the way the site's other 3-up card grids do;
   no intermediate 2-column state (§16.3).
   The 26px top margin is the gap to the intro line above: that paragraph is :last-child
   in its .prose block, so its own margin-bottom is 0 and the grid has to carry it. */
.city-link-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin:26px 0}
@media(max-width:860px){.city-link-grid{grid-template-columns:1fr}}
.city-link{
  background:var(--card);border:1px solid var(--line);border-radius:var(--radius-md);
  padding:20px;box-shadow:var(--neu-soft);color:var(--ink);font-weight:600;
  text-decoration:none!important;transition:border-color .15s ease,color .15s ease,transform .15s ease;
}
.city-link:hover{border-color:var(--action);color:var(--action)}
.city-link:active{transform:translateY(1px)}
.city-link small{
  display:block;font-family:var(--font-mono);font-weight:400;font-size:var(--fs-2xs);
  color:var(--ink-45);margin-top:6px;
}

/* ---------- punch lightbox ---------- */
.img-lightbox{
  position:fixed;inset:0;background:rgba(0,0,0,.85);
  display:flex;align-items:center;justify-content:center;z-index:9999;cursor:zoom-out;
}
.img-lightbox[hidden]{display:none}
.img-lightbox img{
  background:var(--plate);padding:24px;border-radius:var(--radius-lg);
  max-width:min(90vw,520px);max-height:90vh;image-rendering:-webkit-optimize-contrast;
}
.img-lightbox-caption{
  position:absolute;bottom:20px;left:50%;transform:translateX(-50%);
  color:#fff;font-family:var(--font-mono);font-size:var(--fs-2xs);
  background:rgba(0,0,0,.6);padding:8px 14px;border-radius:9px;
}
.img-lightbox-close{
  position:absolute;top:16px;right:16px;width:36px;height:36px;
  background:rgba(0,0,0,.55);color:#fff;border:0;border-radius:50%;cursor:pointer;
  font-size:1.6rem;line-height:1;display:flex;align-items:center;justify-content:center;
}
    </style>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>

    <nav class="nav" aria-label="Main">
      <div class="nav-inner">
        <a class="brand" href="/">
          <svg class="fh-logo" viewBox="0 0 400 420" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true"><path d="M165.114 18.1H384L375.193 62.6817H201.204C184.22 62.6817 153.27 76.778 146.901 110.745C140.533 144.712 132.273 187.935 132.273 187.935H165.114L156.622 226.148H124.35L92.6553 385.368H25L84.4422 96.6487C97.1547 46.3552 118.409 18.1 165.114 18.1Z"/><path d="M213.959 85.1461L152.374 385.369H186.341C186.341 385.369 206.367 289.56 218.211 226.552C221.29 212.458 223.055 201.637 226.135 187.543C231.938 154.381 247.467 85.1461 247.467 85.1461H213.959Z"/><path d="M281.873 187.935C245.783 183.69 226.135 187.543 226.135 187.543C223.055 201.637 221.29 212.458 218.211 226.552C232.897 226.552 254.781 226.552 254.781 226.552C272.918 227.275 273.093 239.398 266.362 267.389L243.66 385.369H309.471C309.471 385.369 328.577 289.836 332.823 260.115C337.069 230.394 317.963 192.181 281.873 187.935Z"/></svg>
          FlipperHelper
        </a>
        <div class="nav-links">
            <a href="/tools/">Free tools</a>
            <a href="/compare/">Compare</a>
            <a href="/#workbench">What's next</a>
            <a href="/blog/">Blog</a>
            <a href="/faq.html">FAQ</a>
            <a href="/about.html">About</a>
            <a class="btn btn-primary" href="/#get">Get the App</a>
        </div>
      </div>
    </nav>

    <main id="main">

  <!-- ======================= PAGE HEAD ======================= -->
  <header class="page-head">
    <div class="wrap">
      <h1>${esc(c.name)} Silver Hallmarks</h1>
      <p class="head-updated">Last verified: ${ukDate(data._last_verified)}</p>
      <a class="backlink" href="uk-silver-hallmarks.html">&larr; Back to the UK Silver Hallmarks Identifier</a>
    </div>
  </header>

  <!-- ======================= TOWN MARK ======================= -->
  <!-- No eyebrow or .section-title here: the mark name is the card's own heading, as
       it was before the redesign. The card is this page's proof object, the way the
       receipt opens the home page. -->
  <section id="town-mark" aria-labelledby="town-mark-title">
    <div class="wrap">
      <div class="mark-hero">
        <div class="mark-img" id="hero-img" data-slug="${esc(c.slug)}">
          <span>${esc(c.mark_name.split(' (')[0])}</span>
        </div>
        <div class="mark-hero-text">
          <h2 id="town-mark-title">${esc(c.mark_name)}</h2>
          <p>${esc(c.mark_blurb)}</p>
          <p class="mark-meta">
            <span>In use since <b>${c.active_from}</b></span>
            <span>${c.active_to ? `Closed <b>${c.active_to}</b>` : 'Still active'}</span>
            <span>${esc(c.country)}</span>${cycleCount ? `
            <span><b>${cycleCount}</b> cycles</span>
            <span><b>${letterCount}</b> dated letters on this page</span>` : ''}
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- ======================= HISTORY ======================= -->
  <section id="history" aria-labelledby="history-title">
    <div class="wrap">
      <span class="eyebrow">Background</span>
      <h2 class="section-title" id="history-title">History</h2>
      <div class="prose">
        <p>${esc(c.narrative_history)}</p>
      </div>
    </div>
  </section>

  <!-- ======================= READING THE MARKS ======================= -->
  <section class="story" id="reading" aria-labelledby="reading-title">
    <div class="wrap">
      <span class="eyebrow">Reading the marks</span>
      <h2 class="section-title" id="reading-title">Reading the marks on ${indefArticle(c.name)} ${esc(c.name)} piece</h2>
      <div class="prose">
        <p>${esc(c.narrative_marks)}</p>
      </div>
    </div>
  </section>

  <!-- ======================= DATING ======================= -->
  <section id="dating" aria-labelledby="dating-title">
    <div class="wrap">
      <span class="eyebrow">Dating</span>
      <h2 class="section-title" id="dating-title">Identifying the date &mdash; using the date letter</h2>
      <div class="prose">
        <p>${esc(c.narrative_dating)}</p>
        <p class="callout"><strong>Faster:</strong> the <a href="uk-silver-hallmarks.html#wiz">main UK Silver Hallmarks Identifier</a> walks you through standard mark, town mark, cycle, and letter step by step and prints the year. Use the chart further down this page if you prefer to scan visually.</p>
      </div>
    </div>
  </section>

${dateLetterChartHTML(officeData, c.name)}

  <!-- ======================= OTHER OFFICES ======================= -->
  <section id="other-offices" aria-labelledby="other-offices-title">
    <div class="wrap">
      <span class="eyebrow">Other offices</span>
      <h2 class="section-title" id="other-offices-title">The other UK Assay Offices</h2>
      <div class="prose">
        <p>If your piece&rsquo;s town mark doesn&rsquo;t match the ${esc(c.mark_name)}, try one of the other active offices:</p>
      </div>
      <div class="city-link-grid">
${siblingLinks(c.slug)}
      </div>
      <div class="prose">
        <p>For closed historical offices &mdash; Chester, Newcastle, Exeter, York, Glasgow &mdash; and Dublin, see the <a href="uk-silver-hallmarks.html#wiz">main identifier</a>; full per-office cycle data is wired into the wizard for those too.</p>
      </div>
    </div>
  </section>

  <!-- ======================= RELATED ======================= -->
  <section id="related" aria-labelledby="related-title">
    <div class="wrap">
      <span class="eyebrow">References</span>
      <h2 class="section-title" id="related-title">Related</h2>
      <ul class="answers">
        <li><a href="uk-silver-hallmarks.html">Main UK Silver Hallmarks Identifier</a> &mdash; the multi-office wizard</li>
        <li>Official site: ${c.office_url ? `<a href="${esc(c.office_url)}" target="_blank" rel="noopener">${esc(c.office_url_label)}</a>` : esc(c.office_url_label)}</li>
        <li><a href="https://www.thegoldsmiths.co.uk/" target="_blank" rel="noopener">Goldsmiths&rsquo; Company</a> &mdash; the compulsory hallmarking authority for England and Wales</li>
      </ul>
    </div>
  </section>

  <div class="wrap"><hr class="tear"></div>

  <!-- ======================= FINAL CTA ======================= -->
  <section class="final" id="track" aria-labelledby="final-title">
    <div class="wrap">
      <h2 id="final-title">Track silver flips with FlipperHelper</h2>
      <p>If you flip silver, FlipperHelper logs each piece with photos, tracks listings across eBay, Vinted, and 14 other platforms, and shows real profit per item after every expense. Free on the App Store.</p>
      <div class="store-row">
        <a class="btn btn-primary" href="https://apps.apple.com/us/app/flipperhelper/id6759716745" target="_blank" rel="noopener">Download FlipperHelper Free on the App Store</a>
        <a class="btn btn-primary" href="https://flipperhelper.app/get-the-app.html" target="_blank" rel="noopener">Get FlipperHelper Free on Google Play</a>
      </div>
    </div>
  </section>

    </main>

    <div class="img-lightbox" id="img-lightbox" hidden role="dialog" aria-label="Enlarged hallmark image" aria-modal="true">
        <button type="button" class="img-lightbox-close" id="img-lightbox-close" aria-label="Close">×</button>
        <img alt="">
        <div class="img-lightbox-caption" id="img-lightbox-caption"></div>
    </div>
    <footer class="ft-c3">
      <div class="wrap">
        <div class="foot-grid">
          <div class="foot-left foot-col">
            <a class="brand" href="/" style="font-size:1rem"><svg class="fh-logo" viewBox="0 0 400 420" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true"><path d="M165.114 18.1H384L375.193 62.6817H201.204C184.22 62.6817 153.27 76.778 146.901 110.745C140.533 144.712 132.273 187.935 132.273 187.935H165.114L156.622 226.148H124.35L92.6553 385.368H25L84.4422 96.6487C97.1547 46.3552 118.409 18.1 165.114 18.1Z"/><path d="M213.959 85.1461L152.374 385.369H186.341C186.341 385.369 206.367 289.56 218.211 226.552C221.29 212.458 223.055 201.637 226.135 187.543C231.938 154.381 247.467 85.1461 247.467 85.1461H213.959Z"/><path d="M281.873 187.935C245.783 183.69 226.135 187.543 226.135 187.543C223.055 201.637 221.29 212.458 218.211 226.552C232.897 226.552 254.781 226.552 254.781 226.552C272.918 227.275 273.093 239.398 266.362 267.389L243.66 385.369H309.471C309.471 385.369 328.577 289.836 332.823 260.115C337.069 230.394 317.963 192.181 281.873 187.935Z"/></svg>FlipperHelper</a>
            <p>The inventory &amp; profit tracker for resellers who source in person. Built at the car boot in London.</p>
            <h4>Follow</h4>
            <nav class="row-nav" aria-label="Footer — follow">
              <a href="https://www.instagram.com/flipperhelper"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".9" fill="currentColor" stroke="none"/></svg>Instagram</a>
              <a href="https://www.reddit.com/r/flipperhelper/"><svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="14" rx="8" ry="5.5"/><circle cx="9" cy="13.4" r=".9" fill="currentColor" stroke="none"/><circle cx="15" cy="13.4" r=".9" fill="currentColor" stroke="none"/><path d="M9.5 16.3c1.6 1 3.4 1 5 0"/><path d="M12 8.5l1-4 3.5 1"/><circle cx="17.3" cy="5.2" r="1.1"/></svg>Reddit</a>
            </nav>
          </div>
          <div class="foot-col">
            <h4>Product</h4>
            <nav aria-label="Footer — product">
              <a href="/flipperhelper-pricing.html">Pricing</a>
              <a href="/tools/">Free tools</a>
              <a href="/compare/">Compare apps</a>
              <a href="/changelog.html">Changelog</a>
              <a href="/sources.html">Supported platforms</a>
            </nav>
          </div>
          <div class="foot-col">
            <h4>Company</h4>
            <nav aria-label="Footer — company">
              <a href="/about.html">About</a>
              <a href="/blog/">Blog</a>
              <a href="/press/">Press kit</a>
              <a href="/is-flipperhelper-legit.html">Is FlipperHelper legit?</a>
              <a href="/flipperhelper-review.html">Review</a>
            </nav>
          </div>
          <div class="foot-col">
            <h4>Help &amp; legal</h4>
            <nav aria-label="Footer — help and legal">
              <a href="mailto:support@flipperhelper.app">Support</a>
              <a href="/faq.html">FAQ</a>
              <a href="/privacy.html">Privacy</a>
              <a href="/terms.html">Terms</a>
            </nav>
          </div>
        </div>
        <div class="foot-bottom">
          <span>Community at <a href="https://www.reddit.com/r/flipperhelper/">r/flipperhelper</a></span>
          <span>© 2025–2026 Oleksandr Prudnikov. Built for Valentina — and every reseller up before dawn.</span>
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
            buckets.forEach(b => b.classList.add('is-hidden'));
            buttons.forEach(b => b.setAttribute('aria-pressed', 'false'));
            if (status) status.textContent = defaultStatus;
        }
        function pick(key, btn) {
            buttons.forEach(b => b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'));
            let count = 0;
            buckets.forEach(b => {
                const match = b.dataset.letter === key;
                b.classList.toggle('is-hidden', !match);
                if (match) count = b.querySelectorAll('.letter-card').length;
            });
            if (status) {
                const display = btn.firstChild ? btn.firstChild.textContent : key;
                status.textContent = 'Showing ' + count + ' year' + (count === 1 ? '' : 's') + ' for letter "' + display + '".';
            }
        }
        buttons.forEach(btn => btn.addEventListener('click', () => pick(btn.dataset.pick, btn)));
        if (clearBtn) clearBtn.addEventListener('click', clear);
    })();

    // Lightbox + magnifier on every letter card
    (function () {
        const lb = document.getElementById('img-lightbox');
        const lbImg = lb && lb.querySelector('img');
        const lbCap = document.getElementById('img-lightbox-caption');
        const lbClose = document.getElementById('img-lightbox-close');
        if (!lb || !lbImg) return;
        function open(src, caption) {
            lbImg.src = src;
            if (lbCap) lbCap.textContent = caption || '';
            lb.hidden = false;
        }
        function close() { lb.hidden = true; }
        lb.addEventListener('click', e => { if (e.target === lb || e.target === lbImg) close(); });
        if (lbClose) lbClose.addEventListener('click', close);
        document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
        document.querySelectorAll('.letter-card').forEach(card => {
            const img = card.querySelector('.letter-card-img img');
            if (!img) return;
            const year = (card.querySelector('.letter-card-year') || {}).textContent || '';
            const cycle = (card.querySelector('.letter-card-cycle') || {}).textContent || '';
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'zoom-btn';
            btn.setAttribute('aria-label', 'Show larger image');
            btn.textContent = '⤢';
            btn.addEventListener('click', e => { e.stopPropagation(); open(img.src, year + ' · ' + cycle); });
            card.appendChild(btn);
        });
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
