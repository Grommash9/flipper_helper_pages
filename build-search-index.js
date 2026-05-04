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
    'press/index.html',
    'blog/index.html',
];

const decode = (s) => s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#39;/g, "'")
    .replace(/&rsquo;|&lsquo;/g, "'").replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&mdash;/g, '—').replace(/&ndash;/g, '–').replace(/&hellip;/g, '…')
    .replace(/&pound;/g, '£').replace(/&euro;/g, '€').replace(/&copy;/g, '©');

function extract(htmlPath, urlPath) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const t = html.match(/<title>([^<]+)<\/title>/);
    const d = html.match(/<meta name="description" content="([^"]+)"/);
    let title = t ? decode(t[1]) : urlPath;
    title = title.replace(/\s*[-|—]?\s*FlipperHelper(\s+Blog)?\s*$/i, '').replace(/\s*\|\s*$/, '').trim();
    let type = 'page';
    if (urlPath.startsWith('/blog/')) type = 'post';
    if (urlPath === '/') type = 'home';
    return { url: urlPath, title, description: d ? decode(d[1]) : '', type };
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
