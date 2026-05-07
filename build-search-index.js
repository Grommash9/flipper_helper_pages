#!/usr/bin/env node
// Regenerates search-index.json from current HTML files.
// Run after adding/removing/renaming pages or blog posts:
//   node build-search-index.js

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const BLOG_DIR = path.join(ROOT, 'blog');
const OUT = path.join(ROOT, 'search-index.json');

const TOP_LEVEL = [
    'index.html',
    'about.html',
    'faq.html',
    'changelog.html',
    'sources.html',
    'flipperhelper-review.html',
    'is-flipperhelper-legit.html',
    'flipperhelper-alternatives.html',
    'flipperhelper-pricing.html',
    'tools/index.html',
    'tools/uk-silver-hallmarks.html',
    'tools/silver-hallmarks-london.html',
    'tools/silver-hallmarks-birmingham.html',
    'tools/silver-hallmarks-sheffield.html',
    'tools/silver-hallmarks-edinburgh.html',
    'press/index.html',
    'blog/index.html',
];

const decode = (s) => s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#39;/g, "'")
    .replace(/&rsquo;|&lsquo;/g, "'").replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&hellip;/g, '…')
    .replace(/&pound;/g, '£').replace(/&euro;/g, '€').replace(/&copy;/g, '©');

const DESC_MIN = 80;
const DESC_MAX = 155;
const descWarnings = [];

function extract(htmlPath, urlPath) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const t = html.match(/<title>([^<]+)<\/title>/);
    const d = html.match(/<meta name="description" content="([^"]+)"/);
    let title = t ? decode(t[1]) : urlPath;
    title = title.replace(/\s*[-|—]?\s*FlipperHelper(\s+Blog)?\s*$/i, '').replace(/\s*\|\s*$/, '').trim();
    let type = 'page';
    if (urlPath.startsWith('/blog/')) type = 'post';
    if (urlPath === '/') type = 'home';
    const desc = d ? decode(d[1]) : '';
    if (!desc) {
        descWarnings.push(`  no <meta description>: ${urlPath}`);
    } else if (desc.length > DESC_MAX) {
        descWarnings.push(`  ${desc.length} chars (>${DESC_MAX}, will be truncated): ${urlPath}`);
    } else if (desc.length < DESC_MIN) {
        descWarnings.push(`  ${desc.length} chars (<${DESC_MIN}, under-utilised): ${urlPath}`);
    }
    return { url: urlPath, title, description: desc, type };
}

const pages = [];
for (const p of TOP_LEVEL) {
    const full = path.join(ROOT, p);
    if (!fs.existsSync(full)) continue;
    const url = '/' + p.replace(/^index\.html$/, '');
    pages.push(extract(full, url));
}
pages[0].url = '/';

const blogFiles = fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.html') && f !== 'index.html')
    .sort();
for (const f of blogFiles) pages.push(extract(path.join(BLOG_DIR, f), '/blog/' + f));

fs.writeFileSync(OUT, JSON.stringify(pages, null, 2));
console.log('Wrote', OUT);
console.log('Pages:', pages.length, 'Bytes:', fs.statSync(OUT).size);

if (descWarnings.length) {
    console.log(`\nMeta description warnings (target ${DESC_MIN}-${DESC_MAX} chars):`);
    descWarnings.forEach(w => console.log(w));
    console.log(`Total: ${descWarnings.length}`);
}
