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
    return arr.map(s => `                        <li>${esc(s)}</li>`).join('\n');
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

    const faq = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: `What is the difference between ${a.name} and ${b.name}?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: sameCategory
                        ? `${a.name} and ${b.name} are both ${a.applicationSubCategory.toLowerCase()}s but differ in platforms, pricing, and feature focus. ${a.name}: ${a.tagline}. ${b.name}: ${b.tagline}.`
                        : `${a.name} and ${b.name} solve different problems. ${a.name} is a ${a.applicationSubCategory.toLowerCase()}; ${b.name} is a ${b.applicationSubCategory.toLowerCase()}. A tracker answers "Am I making money?"; a cross-lister answers "How do I list faster?". Many resellers use one of each.`
                }
            },
            {
                '@type': 'Question',
                name: `${a.name} or ${b.name} — which should I use?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: `${a.name} is best for: ${a.best_for}. ${b.name} is best for: ${b.best_for}. The right choice depends on your sourcing pattern, the platforms you sell on, and whether you want a free tool or a subscription.`
                }
            },
            {
                '@type': 'Question',
                name: `What does ${a.name} cost?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: a.price_paid ? `${a.name}: ${a.price_free}. Paid: ${a.price_paid}.` : `${a.name}: ${a.price_free}.`
                }
            },
            {
                '@type': 'Question',
                name: `What does ${b.name} cost?`,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: b.price_paid ? `${b.name}: ${b.price_free}. Paid: ${b.price_paid}.` : `${b.name}: ${b.price_free}.`
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
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}">
    <link rel="icon" type="image/svg+xml" href="../logo_FH.svg">
    <link rel="stylesheet" href="../styles.css">
    <link rel="stylesheet" href="/footer.css">
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
                <a href="/tools/">Tools</a>
                <a href="/compare/">Compare</a>
                <a href="../faq.html">FAQ</a>
            </div>
        </div>
    </nav>

    <main class="legal-page">
        <div class="container">
            <article class="legal-content">
                <h1>${esc(a.name)} vs ${esc(b.name)}: Which Reseller App?</h1>
                <p class="legal-updated">Last verified: ${data._last_verified}</p>

                <section>
                    <h2>Quick verdict</h2>
                    <p>${sameCategory
                        ? `<strong>${esc(a.name)} and ${esc(b.name)} sit in the same category</strong> (${esc(a.applicationSubCategory.toLowerCase())}s) but differ in platforms, pricing, and feature focus.`
                        : `<strong>These two apps solve different problems.</strong> ${esc(a.name)} is a ${esc(a.applicationSubCategory.toLowerCase())}; ${esc(b.name)} is a ${esc(b.applicationSubCategory.toLowerCase())}. A tracker tells you whether you're making money; a cross-lister helps you list faster across multiple platforms.`}</p>
                    <ul>
                        <li><strong>Choose ${esc(a.name)} if:</strong> ${esc(a.best_for)}.</li>
                        <li><strong>Choose ${esc(b.name)} if:</strong> ${esc(b.best_for)}.</li>
                        ${!sameCategory ? `<li><strong>Many resellers use both</strong> — a tracker for the money side, a cross-lister for the listing side.</li>` : ''}
                    </ul>
                </section>

                <section>
                    <h2>Side-by-side comparison</h2>
                    <div style="overflow-x:auto;">
                        <table style="width:100%;border-collapse:collapse;">
                            <thead>
                                <tr style="background:#F9DDA5;">
                                    <th style="padding:0.75rem 0.5rem;text-align:left;">Feature</th>
                                    <th style="padding:0.75rem 0.5rem;">${esc(a.name)}</th>
                                    <th style="padding:0.75rem 0.5rem;">${esc(b.name)}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td style="padding:0.5rem;border-bottom:1px solid #eee;"><strong>Category</strong></td><td style="padding:0.5rem;border-bottom:1px solid #eee;">${esc(a.applicationSubCategory)}</td><td style="padding:0.5rem;border-bottom:1px solid #eee;">${esc(b.applicationSubCategory)}</td></tr>
                                <tr><td style="padding:0.5rem;border-bottom:1px solid #eee;"><strong>Platforms</strong></td><td style="padding:0.5rem;border-bottom:1px solid #eee;">${esc(a.operatingSystem)}</td><td style="padding:0.5rem;border-bottom:1px solid #eee;">${esc(b.operatingSystem)}</td></tr>
                                <tr><td style="padding:0.5rem;border-bottom:1px solid #eee;"><strong>Free tier</strong></td><td style="padding:0.5rem;border-bottom:1px solid #eee;">${esc(a.price_free)}</td><td style="padding:0.5rem;border-bottom:1px solid #eee;">${esc(b.price_free)}</td></tr>
                                <tr><td style="padding:0.5rem;border-bottom:1px solid #eee;"><strong>Paid tier</strong></td><td style="padding:0.5rem;border-bottom:1px solid #eee;">${a.price_paid ? esc(a.price_paid) : '<em>None planned at this time</em>'}</td><td style="padding:0.5rem;border-bottom:1px solid #eee;">${b.price_paid ? esc(b.price_paid) : '<em>None planned at this time</em>'}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h2>What ${esc(a.name)} does well</h2>
                    <ul>
${bullets(a.strengths)}
                    </ul>
                    <h3>${esc(a.name)} limitations</h3>
                    <ul>
${bullets(a.limitations)}
                    </ul>
                </section>

                <section>
                    <h2>What ${esc(b.name)} does well</h2>
                    <ul>
${bullets(b.strengths)}
                    </ul>
                    <h3>${esc(b.name)} limitations</h3>
                    <ul>
${bullets(b.limitations)}
                    </ul>
                </section>

                <section>
                    <h2>Where to read more</h2>
                    <ul>
                        <li><a href="../blog/flipperhelper-vs-flippd-vs-vendoo.html">Three-app comparison: FlipperHelper vs Flippd vs Vendoo</a> — full feature matrix and category explanation.</li>
                        <li><a href="../flipperhelper-alternatives.html">All FlipperHelper alternatives</a> — including spreadsheets, Notion, and pen-and-paper.</li>
                        <li><a href="${esc(a.url)}" rel="noopener" target="_blank">${esc(a.name)} official site</a></li>
                        <li><a href="${esc(b.url)}" rel="noopener" target="_blank">${esc(b.name)} official site</a></li>
                    </ul>
                </section>

                <section style="margin-top: 3em; text-align: center;">
                    <a href="https://apps.apple.com/us/app/flipperhelper/id6759716745" class="btn btn-primary" target="_blank" rel="noopener">Download FlipperHelper Free on the App Store</a>
                </section>
            </article>
        </div>
    </main>

    <footer>
      <div class="wrap">
        <div class="foot-grid">
          <div class="foot-left">
            <a class="brand" href="/" style="font-size:1rem"><svg class="fh-logo" viewBox="0 0 400 420" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true"><path d="M165.114 18.1H384L375.193 62.6817H201.204C184.22 62.6817 153.27 76.778 146.901 110.745C140.533 144.712 132.273 187.935 132.273 187.935H165.114L156.622 226.148H124.35L92.6553 385.368H25L84.4422 96.6487C97.1547 46.3552 118.409 18.1 165.114 18.1Z"/><path d="M213.959 85.1461L152.374 385.369H186.341C186.341 385.369 206.367 289.56 218.211 226.552C221.29 212.458 223.055 201.637 226.135 187.543C231.938 154.381 247.467 85.1461 247.467 85.1461H213.959Z"/><path d="M281.873 187.935C245.783 183.69 226.135 187.543 226.135 187.543C223.055 201.637 221.29 212.458 218.211 226.552C232.897 226.552 254.781 226.552 254.781 226.552C272.918 227.275 273.093 239.398 266.362 267.389L243.66 385.369H309.471C309.471 385.369 328.577 289.836 332.823 260.115C337.069 230.394 317.963 192.181 281.873 187.935Z"/></svg>FlipperHelper</a>
            <p>The inventory &amp; profit tracker for resellers who source in person. Built at the car boot in London.</p>
          </div>
          <div class="foot-col">
            <h4>Explore</h4>
            <nav aria-label="Footer — explore">
              <a href="/blog/">Blog</a>
              <a href="/tools/">Free tools</a>
              <a href="/compare/">Compare apps</a>
              <a href="/changelog.html">Changelog</a>
              <a href="/sources.html">Supported platforms</a>
              <a href="/press/">Press kit</a>
              <a href="/about.html">About</a>
            </nav>
          </div>
          <div class="foot-col">
            <h4>Follow</h4>
            <nav aria-label="Footer — follow">
              <a href="https://www.instagram.com/flipperhelper"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".9" fill="currentColor" stroke="none"/></svg>Instagram</a>
              <a href="https://www.reddit.com/r/flipperhelper/"><svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="14" rx="8" ry="5.5"/><circle cx="9" cy="13.4" r=".9" fill="currentColor" stroke="none"/><circle cx="15" cy="13.4" r=".9" fill="currentColor" stroke="none"/><path d="M9.5 16.3c1.6 1 3.4 1 5 0"/><path d="M12 8.5l1-4 3.5 1"/><circle cx="17.3" cy="5.2" r="1.1"/></svg>Reddit</a>
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
    const items = data.pairs.map(([aSlug, bSlug]) => {
        const a = data.apps[aSlug], b = data.apps[bSlug];
        return `                        <li><a href="${aSlug}-vs-${bSlug}.html"><strong>${esc(a.name)} vs ${esc(b.name)}</strong></a> — ${esc(a.applicationSubCategory)} vs ${esc(b.applicationSubCategory)}</li>`;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="apple-itunes-app" content="app-id=6759716745">
    <title>Compare Reseller Apps: FlipperHelper, Flippd, Vendoo | FlipperHelper</title>
    <meta name="description" content="Side-by-side comparisons of reseller apps: FlipperHelper, Flippd, Vendoo. Tracker vs cross-lister, free vs paid, iOS vs multi-platform.">
    <link rel="icon" type="image/svg+xml" href="../logo_FH.svg">
    <link rel="stylesheet" href="../styles.css">
    <link rel="stylesheet" href="/footer.css">
    <link rel="canonical" href="https://flipperhelper.app/compare/">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Compare Reseller Apps">
    <meta property="og:description" content="Side-by-side comparisons of reseller apps. Tracker vs cross-lister, free vs paid, iOS vs multi-platform.">
    <meta property="og:url" content="https://flipperhelper.app/compare/">
    <meta property="og:site_name" content="FlipperHelper">
    <meta name="twitter:card" content="summary">
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
                <a href="/tools/">Tools</a>
                <a href="/compare/">Compare</a>
                <a href="../faq.html">FAQ</a>
            </div>
        </div>
    </nav>
    <main class="legal-page">
        <div class="container">
            <article class="legal-content">
                <h1>Compare Reseller Apps</h1>
                <p class="legal-updated">Last verified: ${data._last_verified}</p>
                <p>Side-by-side comparisons of reseller apps. Each page covers category, platforms, pricing, strengths, and honest limitations.</p>
                <p>The first thing worth knowing is that these apps aren&rsquo;t all the same kind of tool. A <strong>tracker</strong> (like FlipperHelper) records what you bought, what you sold it for, and your real profit per item &mdash; it does not list anything for you. A <strong>cross-lister</strong> (like Vendoo) posts one item to several marketplaces at once but doesn&rsquo;t focus on profit accounting. Picking the wrong category is the most common mistake, so each comparison below states plainly what the app <em>is</em>, what it costs, and where it falls short &mdash; including where FlipperHelper itself isn&rsquo;t the right fit.</p>
                <p>We keep these honest on purpose: if you only sell on one platform and care about profit, a tracker wins; if you list the same stock across eBay, Vinted, and Depop daily, a cross-lister may be worth the subscription. Use the pages below to match the tool to how you actually sell.</p>
                <section>
                    <h2>Available comparisons</h2>
                    <ul>
${items}
                    </ul>
                </section>
                <section>
                    <h2>Looking for more?</h2>
                    <ul>
                        <li><a href="../blog/flipperhelper-vs-flippd-vs-vendoo.html">Three-app comparison post</a></li>
                        <li><a href="../flipperhelper-alternatives.html">All FlipperHelper alternatives</a> (including spreadsheets, Notion, and paper)</li>
                    </ul>
                </section>
            </article>
        </div>
    </main>
    <footer>
      <div class="wrap">
        <div class="foot-grid">
          <div class="foot-left">
            <a class="brand" href="/" style="font-size:1rem"><svg class="fh-logo" viewBox="0 0 400 420" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true"><path d="M165.114 18.1H384L375.193 62.6817H201.204C184.22 62.6817 153.27 76.778 146.901 110.745C140.533 144.712 132.273 187.935 132.273 187.935H165.114L156.622 226.148H124.35L92.6553 385.368H25L84.4422 96.6487C97.1547 46.3552 118.409 18.1 165.114 18.1Z"/><path d="M213.959 85.1461L152.374 385.369H186.341C186.341 385.369 206.367 289.56 218.211 226.552C221.29 212.458 223.055 201.637 226.135 187.543C231.938 154.381 247.467 85.1461 247.467 85.1461H213.959Z"/><path d="M281.873 187.935C245.783 183.69 226.135 187.543 226.135 187.543C223.055 201.637 221.29 212.458 218.211 226.552C232.897 226.552 254.781 226.552 254.781 226.552C272.918 227.275 273.093 239.398 266.362 267.389L243.66 385.369H309.471C309.471 385.369 328.577 289.836 332.823 260.115C337.069 230.394 317.963 192.181 281.873 187.935Z"/></svg>FlipperHelper</a>
            <p>The inventory &amp; profit tracker for resellers who source in person. Built at the car boot in London.</p>
          </div>
          <div class="foot-col">
            <h4>Explore</h4>
            <nav aria-label="Footer — explore">
              <a href="/blog/">Blog</a>
              <a href="/tools/">Free tools</a>
              <a href="/compare/">Compare apps</a>
              <a href="/changelog.html">Changelog</a>
              <a href="/sources.html">Supported platforms</a>
              <a href="/press/">Press kit</a>
              <a href="/about.html">About</a>
            </nav>
          </div>
          <div class="foot-col">
            <h4>Follow</h4>
            <nav aria-label="Footer — follow">
              <a href="https://www.instagram.com/flipperhelper"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".9" fill="currentColor" stroke="none"/></svg>Instagram</a>
              <a href="https://www.reddit.com/r/flipperhelper/"><svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="14" rx="8" ry="5.5"/><circle cx="9" cy="13.4" r=".9" fill="currentColor" stroke="none"/><circle cx="15" cy="13.4" r=".9" fill="currentColor" stroke="none"/><path d="M9.5 16.3c1.6 1 3.4 1 5 0"/><path d="M12 8.5l1-4 3.5 1"/><circle cx="17.3" cy="5.2" r="1.1"/></svg>Reddit</a>
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
