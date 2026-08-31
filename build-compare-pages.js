#!/usr/bin/env node
// Builds /compare/{a}-vs-{b}.html pages from compare/data.json.
// Add an app: edit compare/data.json (apps + pairs), then run:
//   node build-compare-pages.js

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'compare', 'data.json');
const OUT_DIR = path.join(ROOT, 'compare');
const TODAY = new Date().toISOString().slice(0, 10);

const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));

const esc = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Description for the meta tag — must be 80–155 chars.
function metaDesc(a, b) {
    // Tracker vs cross-lister wording when one is each
    const aIsCross = a.applicationSubCategory.toLowerCase().includes('cross-lister');
    const bIsCross = b.applicationSubCategory.toLowerCase().includes('cross-lister');
    let s;
    if (aIsCross !== bIsCross) {
        s = `${a.name} vs ${b.name}: tracker vs cross-lister. Different problems, different tools. Honest comparison so you choose the right one.`;
    } else {
        s = `${a.name} vs ${b.name}: a side-by-side comparison of features, price, platforms, and which app fits which reseller workflow.`;
    }
    if (s.length > 155) s = s.slice(0, 152).replace(/\s+\S*$/, '') + '…';
    return s;
}

function softwareApp(app) {
    const offers = app.price_paid
        ? [
            { '@type': 'Offer', name: 'Free tier', price: '0', priceCurrency: 'USD', description: app.price_free },
            { '@type': 'Offer', name: 'Paid', price: extractPrice(app.price_paid), priceCurrency: 'USD', description: app.price_paid }
          ]
        : { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: app.price_free, availability: 'https://schema.org/InStock' };
    return {
        '@type': 'SoftwareApplication',
        name: app.name,
        applicationCategory: app.applicationCategory,
        applicationSubCategory: app.applicationSubCategory,
        operatingSystem: app.operatingSystem,
        url: app.url,
        description: app.tagline,
        offers
    };
}
function extractPrice(text) {
    const m = String(text).match(/\$([\d.]+)/);
    return m ? m[1] : '0';
}

function bullets(arr) {
    return arr.map(s => `        <li>${esc(s)}</li>`).join('\n');
}

function pageHTML(a, b) {
    const slug = `${a.slug}-vs-${b.slug}`;
    const title = `${a.name} vs ${b.name}: Which Reseller App Should You Choose? | FlipperHelper`;
    const ogTitle = `${a.name} vs ${b.name}: Which Reseller App?`;
    const desc = metaDesc(a, b);
    const url = `https://flipperhelper.app/compare/${slug}.html`;
    const aIsCross = a.applicationSubCategory.toLowerCase().includes('cross-lister');
    const bIsCross = b.applicationSubCategory.toLowerCase().includes('cross-lister');
    const sameCategory = aIsCross === bIsCross;

    const itemList = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${a.name} vs ${b.name}: reseller app comparison`,
        description: desc,
        itemListOrder: 'https://schema.org/ItemListUnordered',
        numberOfItems: 2,
        itemListElement: [
            { '@type': 'ListItem', position: 1, item: softwareApp(a) },
            { '@type': 'ListItem', position: 2, item: softwareApp(b) }
        ]
    };

    const breadcrumbs = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://flipperhelper.app/' },
            { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://flipperhelper.app/compare/' },
            { '@type': 'ListItem', position: 3, name: `${a.name} vs ${b.name}`, item: url }
        ]
    };

    // Built once so the same question/answer text drives both the FAQPage JSON-LD
    // and the visible accordion below — no risk of the two drifting apart.
    const faqItems = [
        {
            name: `What is the difference between ${a.name} and ${b.name}?`,
            text: sameCategory
                ? `${a.name} and ${b.name} are both ${a.applicationSubCategory.toLowerCase()}s but differ in platforms, pricing, and feature focus. ${a.name}: ${a.tagline}. ${b.name}: ${b.tagline}.`
                : `${a.name} and ${b.name} solve different problems. ${a.name} is a ${a.applicationSubCategory.toLowerCase()}; ${b.name} is a ${b.applicationSubCategory.toLowerCase()}. A tracker answers "Am I making money?"; a cross-lister answers "How do I list faster?". Many resellers use one of each.`
        },
        {
            name: `${a.name} or ${b.name} — which should I use?`,
            text: `${a.name} is best for: ${a.best_for}. ${b.name} is best for: ${b.best_for}. The right choice depends on your sourcing pattern, the platforms you sell on, and whether you want a free tool or a subscription.`
        },
        {
            name: `What does ${a.name} cost?`,
            text: a.price_paid ? `${a.name}: ${a.price_free}. Paid: ${a.price_paid}.` : `${a.name}: ${a.price_free}.`
        },
        {
            name: `What does ${b.name} cost?`,
            text: b.price_paid ? `${b.name}: ${b.price_free}. Paid: ${b.price_paid}.` : `${b.name}: ${b.price_free}.`
        }
    ];

    const faq = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(f => ({
            '@type': 'Question',
            name: f.name,
            acceptedAnswer: { '@type': 'Answer', text: f.text }
        }))
    };

    const faqHTML = faqItems.map(f => `        <details>
          <summary>${esc(f.name)}</summary>
          <p>${esc(f.text)}</p>
        </details>`).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="apple-itunes-app" content="app-id=6759716745">
    <meta name="color-scheme" content="light">
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}">
    <link rel="icon" type="image/svg+xml" href="../logo_FH.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,400;8..144,500;8..144,600;8..144,700;8..144,800&amp;family=Roboto+Mono:wght@400;500;600&amp;display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/landing.css">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${esc(ogTitle)}">
    <meta property="og:description" content="${esc(desc)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="https://flipperhelper.app/logo_FH.png">
    <meta property="og:site_name" content="FlipperHelper">
    <meta property="og:locale" content="en_GB">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${esc(ogTitle)}">
    <meta name="twitter:description" content="${esc(desc)}">
    <meta name="twitter:image" content="https://flipperhelper.app/logo_FH.png">
    <script type="application/ld+json">${JSON.stringify(breadcrumbs, null, 2)}</script>
    <script type="application/ld+json">${JSON.stringify(itemList, null, 2)}</script>
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

/* page head — title + meta line, same recipe as the silver-hallmarks pages */
.page-head{padding:64px 0 0}
@media(max-width:720px){.page-head{padding:44px 0 0}}
.page-head h1{font-size:clamp(2rem,4.4vw,2.8rem);font-weight:800;letter-spacing:-.02em;margin-bottom:12px;max-width:820px}
.head-updated{font-family:var(--font-mono);font-size:var(--fs-2xs);color:var(--ink-45);font-variant-numeric:tabular-nums}
.backlink{display:inline-block;margin-top:14px;font-family:var(--font-mono);font-size:var(--fs-2xs);letter-spacing:.08em}

.prose p{margin-bottom:16px}
.prose p:last-child{margin-bottom:0}
.section-title{margin-bottom:20px}

/* the site's prose bullet: 6px periwinkle dot, bold term then the detail */
.answers{list-style:none}
.answers li{position:relative;padding-left:22px;margin-bottom:9px;color:var(--ink-66)}
.answers li:last-child{margin-bottom:0}
.answers li::before{content:"";position:absolute;left:4px;top:.58em;width:6px;height:6px;border-radius:50%;background:var(--cat)}
.answers strong{color:var(--ink);font-weight:600}

/* "X limitations" sub-heading between the two .answers lists — landing.css only
   sets h3 spacing inside .post, and these sections aren't .post */
.sub-title{font-size:var(--fs-lede);margin:26px 0 8px}
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
            <a href="/compare/" aria-current="page">Compare</a>
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
      <h1>${esc(ogTitle)}</h1>
      <p class="head-updated">Last verified: ${data._last_verified}</p>
      <a class="backlink" href="/compare/">&larr; Back to all comparisons</a>
    </div>
  </header>

  <div class="wrap"><hr class="tear"></div>

  <!-- ======================= QUICK VERDICT ======================= -->
  <section id="verdict" aria-labelledby="verdict-title">
    <div class="wrap">
      <span class="eyebrow">Quick verdict</span>
      <h2 class="section-title" id="verdict-title">Quick verdict</h2>
      <div class="prose">
        <p>${sameCategory
            ? `<strong>${esc(a.name)} and ${esc(b.name)} sit in the same category</strong> (${esc(a.applicationSubCategory.toLowerCase())}s) but differ in platforms, pricing, and feature focus.`
            : `<strong>These two apps solve different problems.</strong> ${esc(a.name)} is a ${esc(a.applicationSubCategory.toLowerCase())}; ${esc(b.name)} is a ${esc(b.applicationSubCategory.toLowerCase())}. A tracker tells you whether you're making money; a cross-lister helps you list faster across multiple platforms.`}</p>
      </div>
      <ul class="answers">
        <li><strong>Choose ${esc(a.name)} if:</strong> ${esc(a.best_for)}.</li>
        <li><strong>Choose ${esc(b.name)} if:</strong> ${esc(b.best_for)}.</li>
        ${!sameCategory ? `<li><strong>Many resellers use both</strong> — a tracker for the money side, a cross-lister for the listing side.</li>` : ''}
      </ul>
    </div>
  </section>

  <!-- ======================= SIDE-BY-SIDE COMPARISON ======================= -->
  <section id="comparison" aria-labelledby="comparison-title">
    <div class="wrap">
      <span class="eyebrow">Side by side</span>
      <h2 class="section-title" id="comparison-title">Side-by-side comparison</h2>
      <div class="cmp-wrap" tabindex="0" role="region" aria-label="${esc(a.name)} vs ${esc(b.name)} comparison table, horizontally scrollable">
        <table class="cmp">
          <thead>
            <tr>
              <th>Feature</th>
              <th>${esc(a.name)}</th>
              <th>${esc(b.name)}</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>Category</strong></td><td>${esc(a.applicationSubCategory)}</td><td>${esc(b.applicationSubCategory)}</td></tr>
            <tr><td><strong>Platforms</strong></td><td>${esc(a.operatingSystem)}</td><td>${esc(b.operatingSystem)}</td></tr>
            <tr><td><strong>Free tier</strong></td><td>${esc(a.price_free)}</td><td>${esc(b.price_free)}</td></tr>
            <tr><td><strong>Paid tier</strong></td><td>${a.price_paid ? esc(a.price_paid) : '<em>None planned at this time</em>'}</td><td>${b.price_paid ? esc(b.price_paid) : '<em>None planned at this time</em>'}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- ======================= APP A ======================= -->
  <section id="${esc(a.slug)}-strengths" aria-labelledby="${esc(a.slug)}-strengths-title">
    <div class="wrap">
      <span class="eyebrow">${esc(a.name)}</span>
      <h2 class="section-title" id="${esc(a.slug)}-strengths-title">What ${esc(a.name)} does well</h2>
      <ul class="answers">
${bullets(a.strengths)}
      </ul>
      <h3 class="sub-title">${esc(a.name)} limitations</h3>
      <ul class="answers">
${bullets(a.limitations)}
      </ul>
    </div>
  </section>

  <!-- ======================= APP B ======================= -->
  <section id="${esc(b.slug)}-strengths" aria-labelledby="${esc(b.slug)}-strengths-title">
    <div class="wrap">
      <span class="eyebrow">${esc(b.name)}</span>
      <h2 class="section-title" id="${esc(b.slug)}-strengths-title">What ${esc(b.name)} does well</h2>
      <ul class="answers">
${bullets(b.strengths)}
      </ul>
      <h3 class="sub-title">${esc(b.name)} limitations</h3>
      <ul class="answers">
${bullets(b.limitations)}
      </ul>
    </div>
  </section>

  <!-- ======================= WHERE TO READ MORE ======================= -->
  <section id="read-more" aria-labelledby="read-more-title">
    <div class="wrap">
      <span class="eyebrow">References</span>
      <h2 class="section-title" id="read-more-title">Where to read more</h2>
      <ul class="answers">
        <li><a href="../blog/flipperhelper-vs-flippd-vs-vendoo.html">Three-app comparison: FlipperHelper vs Flippd vs Vendoo</a> — full feature matrix and category explanation.</li>
        <li><a href="../flipperhelper-alternatives.html">All FlipperHelper alternatives</a> — including spreadsheets, Notion, and pen-and-paper.</li>
        <li><a href="${esc(a.url)}" rel="noopener" target="_blank">${esc(a.name)} official site</a></li>
        <li><a href="${esc(b.url)}" rel="noopener" target="_blank">${esc(b.name)} official site</a></li>
      </ul>
    </div>
  </section>

  <!-- ======================= FAQ ======================= -->
  <section id="faq" aria-labelledby="faq-title">
    <div class="wrap">
      <span class="eyebrow">Common questions</span>
      <h2 class="section-title" id="faq-title">FAQ</h2>
      <div class="faq">
${faqHTML}
      </div>
    </div>
  </section>

  <div class="wrap"><hr class="tear"></div>

  <!-- ======================= FINAL CTA ======================= -->
  <section class="final" id="get" aria-labelledby="final-title">
    <div class="wrap">
      <h2 id="final-title">Track your reselling profit with FlipperHelper</h2>
      <p>Whichever app you land on for cross-listing, FlipperHelper tracks your real profit after every expense — entry fees, transport, packaging, platform fees. Free, no ads.</p>
      <div class="store-row">
        <a class="btn btn-primary" href="https://apps.apple.com/us/app/flipperhelper/id6759716745" target="_blank" rel="noopener">Download FlipperHelper Free on the App Store</a>
        <a class="btn btn-primary" href="https://flipperhelper.app/get-the-app.html" target="_blank" rel="noopener">Download from Google Play</a>
      </div>
    </div>
  </section>

    </main>

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
    <script data-goatcounter="https://grommash9.goatcounter.com/count"
            async src="//gc.zgo.at/count.js"></script>
</body>
</html>
`;
}

function indexHTML() {
    const breadcrumbs = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://flipperhelper.app/' },
            { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://flipperhelper.app/compare/' }
        ]
    };

    const pairCount = data.pairs.length;
    const pairWord = pairCount === 1 ? 'pairing' : 'pairings';

    const rows = data.pairs.map(([aSlug, bSlug]) => {
        const a = data.apps[aSlug], b = data.apps[bSlug];
        return `        <div class="pro-row">
          <dt class="k"><a href="${aSlug}-vs-${bSlug}.html">${esc(a.name)} vs ${esc(b.name)}</a></dt>
          <dd class="v">${esc(a.applicationSubCategory)} <span class="vs">vs</span> ${esc(b.applicationSubCategory)}</dd>
        </div>`;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="apple-itunes-app" content="app-id=6759716745">
    <meta name="color-scheme" content="light">
    <title>Compare Reseller Apps: FlipperHelper, Flippd, Vendoo | FlipperHelper</title>
    <meta name="description" content="Side-by-side comparisons of reseller apps: FlipperHelper, Flippd, Vendoo. Tracker vs cross-lister, free vs paid, iOS vs multi-platform.">
    <link rel="icon" type="image/svg+xml" href="../logo_FH.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,400;8..144,500;8..144,600;8..144,700;8..144,800&amp;family=Roboto+Mono:wght@400;500;600&amp;display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/landing.css">
    <link rel="canonical" href="https://flipperhelper.app/compare/">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Compare Reseller Apps">
    <meta property="og:description" content="Side-by-side comparisons of reseller apps. Tracker vs cross-lister, free vs paid, iOS vs multi-platform.">
    <meta property="og:url" content="https://flipperhelper.app/compare/">
    <meta property="og:site_name" content="FlipperHelper">
    <meta property="og:image" content="https://flipperhelper.app/logo_FH.png">
    <meta property="og:locale" content="en_GB">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="Compare Reseller Apps">
    <meta name="twitter:description" content="Side-by-side comparisons of reseller apps. Tracker vs cross-lister, free vs paid, iOS vs multi-platform.">
    <meta name="twitter:image" content="https://flipperhelper.app/logo_FH.png">
    <script type="application/ld+json">${JSON.stringify(breadcrumbs, null, 2)}</script>
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

    /* page head — the hero-variant without the prop (design guide §25.2) */
    .page-head{padding:64px 0 0}
    @media(max-width:720px){.page-head{padding:44px 0 0}}
    .page-head h1{font-size:clamp(2rem,4.4vw,2.8rem);font-weight:800;letter-spacing:-.02em;margin-bottom:12px;max-width:760px}

    /* The two opening paragraphs are the page's argument, not a section of their own —
       there is no heading for them and a port does not invent one, so they stay in the
       head, at the h1's 760px so the head reads as one column. */
    .head-prose{max-width:760px;margin-top:16px}
    .head-prose p{margin-bottom:16px;color:var(--ink-66);line-height:1.6}
    .head-prose p:last-child{margin-bottom:0}
    .head-prose em{color:var(--ink)}

    /* The comparisons block is index.html:596's "On the bench now · FlipperHelper Pro":
       group label, emphasis card, k/v rows on dashed rules. The card's title is the
       section's own h2 rather than a new h3, so it keeps its place in the heading
       order — .pro-card h3 can't reach it, hence the one rule. */
    .pro-card .pro-title{font-size:var(--fs-h3-lg);margin-bottom:0;font-weight:700;letter-spacing:-.01em}
    /* the lede sits at section level, so the card has no .pro-intro to open the gap
       above its rows — the head carries it, at the intro's 20px */
    .pro-card .pro-head{margin-bottom:20px}

    /* landing.css:353 gives the chip its pill shape under .bench-card only, so inside a
       .pro-card the same markup renders as unpadded square-cornered text on a tint — and
       the 6px dot, being an inline <i>, collapses. Same rule, scoped to this head.
       (index.html:598's "In development" chip has the same gap — flagged, not touched.) */
    .pro-head .status{
      font-family:var(--font-mono);font-size:var(--fs-3xs);font-weight:600;letter-spacing:.12em;
      text-transform:uppercase;display:inline-flex;align-items:center;gap:7px;
      padding:6px 14px;border-radius:999px;
    }

    /* The pairing name is the row's subject and must not wrap: at landing.css:319's 190px
       "FlipperHelper vs Flippd" breaks over two lines and the description starts above its
       own key. 23 characters of Roboto Mono at --fs-2xs is 23 x (.6em advance + .1em
       letter-spacing) x 12px = 193px, so 190px misses it by three.

       max-content does NOT fix it: every .pro-row is its own grid, so each row would size
       its column to its own key and "Flippd vs Vendoo" — seven characters shorter — would
       pull its description left of the other two. A floor of 212px is the same track in
       all three rows, which is what puts the descriptions on one line; max-content is kept
       as the ceiling so a fallback mono with a wider advance pushes the column out instead
       of wrapping. Scoped above landing.css:320's 640px collapse — unmediated, this rule
       outranks that media query and would break the mobile stack. */
    @media(min-width:641px){
      .pro-card .pro-row{grid-template-columns:minmax(212px,max-content) 1fr}
    }

    /* Each value is one "A vs B" sentence; mono lifts the pivot out of it so the two
       halves can be told apart at a glance. The sentence itself is untouched. */
    .pro-row .v .vs{
      font-family:var(--font-mono);font-size:var(--fs-2xs);font-weight:600;
      letter-spacing:.14em;text-transform:uppercase;color:var(--ink-45);padding:0 3px;
    }

    /* See-also rows — .pro-rows from landing.css used outside a .pro-card, the same block
       about.html:275 uses for Get in touch. No orange stripe: a list of further reading
       must not outrank the comparisons above it (design guide §25.5). */
    .link-rows .pro-row:last-child{border-bottom:none}

    /* That section opens straight onto its rows with no lede between, so the heading
       carries the gap the lede would normally open — same device as sources.html. */
    .section-title{margin-bottom:26px}

    a:focus-visible,button:focus-visible{
      outline:2px solid var(--action);outline-offset:3px;border-radius:6px;
    }
    .btn:focus-visible{outline:2px solid var(--action);outline-offset:2px}
</style>
<noscript><style>.reveal{opacity:1;transform:none}</style></noscript>
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
            <a href="/compare/" aria-current="page">Compare</a>
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
    <h1>Compare Reseller Apps</h1>
    <div class="head-prose">
      <p>The first thing worth knowing is that these apps aren&rsquo;t all the same kind of tool. A tracker (like FlipperHelper) records what you bought, what you sold it for, and your real profit per item &mdash; it does not list anything for you. A cross-lister (like Vendoo) posts one item to several marketplaces at once but doesn&rsquo;t focus on profit accounting. Picking the wrong category is the most common mistake, so each comparison below states plainly what the app <em>is</em>, what it costs, and where it falls short &mdash; including where FlipperHelper itself isn&rsquo;t the right fit.</p>
      <p>We keep these honest on purpose: if you only sell on one platform and care about profit, a tracker wins; if you list the same stock across eBay, Vinted, and Depop daily, a cross-lister may be worth the subscription. Use the pages below to match the tool to how you actually sell.</p>
    </div>
  </div>
</header>

<!-- ======================= THE COMPARISONS ======================= -->
<section aria-labelledby="available-title">
  <div class="wrap">
    <span class="eyebrow">Head to head</span>
    <p class="section-lede">Side-by-side comparisons of reseller apps. Each page covers category, platforms, pricing, strengths, and honest limitations.</p>

    <p class="group-label"><b>Compared side by side</b>&nbsp;&middot; ${pairCount} ${pairWord}</p>
    <div class="pro-card reveal">
      <div class="pro-head">
        <h2 class="pro-title" id="available-title">Available comparisons</h2>
        <span class="status status-idea"><i></i>Last verified: ${data._last_verified}</span>
      </div>

      <dl class="pro-rows">
${rows}
      </dl>
    </div>
  </div>
</section>

<div class="wrap"><hr class="tear"></div>

<!-- ======================= LOOKING FOR MORE ======================= -->
<section aria-labelledby="more-title">
  <div class="wrap">
    <span class="eyebrow">Wider view</span>
    <h2 class="section-title" id="more-title">Looking for more?</h2>

    <dl class="pro-rows link-rows reveal">
      <div class="pro-row">
        <dt class="k">Blog</dt>
        <dd class="v"><a href="../blog/flipperhelper-vs-flippd-vs-vendoo.html">Three-app comparison post</a></dd>
      </div>
      <div class="pro-row">
        <dt class="k">Alternatives</dt>
        <dd class="v"><a href="../flipperhelper-alternatives.html">All FlipperHelper alternatives</a> (including spreadsheets, Notion, and paper)</dd>
      </div>
    </dl>
  </div>
</section>

</main>
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
/* reveal (§10) */
(function(){
  var rev = [].slice.call(document.querySelectorAll('.reveal'));
  if (matchMedia('(prefers-reduced-motion: reduce)').matches){
    rev.forEach(function(el){ el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {threshold:.12});
    rev.forEach(function(el){ io.observe(el); });
  }
})();
</script>
<script data-goatcounter="https://grommash9.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>
</body>
</html>
`;
}

let written = 0;
for (const [aSlug, bSlug] of data.pairs) {
    const a = data.apps[aSlug];
    const b = data.apps[bSlug];
    if (!a || !b) {
        console.error(`Skip pair ${aSlug}/${bSlug} — missing app data`);
        continue;
    }
    const out = path.join(OUT_DIR, `${aSlug}-vs-${bSlug}.html`);
    fs.writeFileSync(out, pageHTML(a, b));
    written++;
}
fs.writeFileSync(path.join(OUT_DIR, 'index.html'), indexHTML());
console.log(`Wrote ${written} comparison pages + 1 index to ${OUT_DIR}`);
