#!/usr/bin/env node
// Scrape per-letter date letter pages from silvermakersmarks.co.uk.
// Used with permission of David McKinley (silvermakersmarks.co.uk) — see ATTRIBUTION.md.
//
// Idempotent: caches HTML under _raw/, skips images already downloaded.
// Polite: identifies UA, sequential, 500ms delay between requests.
//
// Run: node tools/scrape-silvermakersmarks.js [--office=London] [--force-html] [--dry-run]

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, 'images/hallmarks');
const RAW = path.join(ROOT, '_raw');
const GLYPHS = path.join(ROOT, 'glyphs');
const FRAMES = path.join(ROOT, 'frames');
const DATA = path.join(ROOT, 'data');

const HOST = 'www.silvermakersmarks.co.uk';
const BASE = `https://${HOST}/Dates`;
const UA = 'flipperhelper-pages/1.0 (+https://flipperhelper.com; oprudnikov@teza.com)';
const DELAY_MS = 500;

const ALL_OFFICES = [
  'London', 'Birmingham', 'Sheffield', 'Edinburgh',
  'Chester', 'Newcastle', 'Exeter', 'York', 'Glasgow', 'Dublin',
];

const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const m = args.find(a => a.startsWith(`--${name}=`));
  return m ? m.split('=')[1] : dflt;
};
const flag = name => args.includes(`--${name}`);

const onlyOffice = opt('office', null);
const forceHtml = flag('force-html');
const dryRun = flag('dry-run');

const sleep = ms => new Promise(r => setTimeout(r, ms));

function fetchUrl(url, asBuffer = false) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': UA } }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchUrl(res.headers.location, asBuffer).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} on ${url}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        resolve(asBuffer ? buf : buf.toString('utf8'));
      });
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(20_000, () => req.destroy(new Error(`Timeout: ${url}`)));
  });
}

async function cachedHtml(url, cachePath) {
  if (!forceHtml && fs.existsSync(cachePath)) {
    return fs.readFileSync(cachePath, 'utf8');
  }
  console.log(`  GET ${url}`);
  const html = await fetchUrl(url);
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, html);
  await sleep(DELAY_MS);
  return html;
}

async function cachedImage(url, dest) {
  if (fs.existsSync(dest)) return;
  console.log(`  IMG ${url}`);
  const buf = await fetchUrl(url, true);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  await sleep(DELAY_MS);
}

// Parse the office index page to find per-letter URLs.
// HTML pattern: <a href="London/Date Letters A.html">A</a>
function parseOfficeIndex(html, office) {
  const re = /href="([^"]*Date Letters [A-Z]\.html)"/gi;
  const out = [];
  const seen = new Set();
  for (const m of html.matchAll(re)) {
    const href = m[1].replace(/\\/g, '/');
    if (seen.has(href)) continue;
    seen.add(href);
    const url = `${BASE}/${encodeURI(href)}`;
    const letter = href.match(/Letters ([A-Z])\.html/i)[1].toUpperCase();
    out.push({ letter, url, href });
  }
  return out;
}

// Classify an image src by filename pattern.
// Frame: <YYYY>-<YYYY|2xxx>.gif    Glyph: <YYYY><A-Z|a-z>.gif    else: marker
function classifyImg(src) {
  const fn = src.split('/').pop();
  let m;
  // Frame with both years closed (e.g. 1697-1715.gif)
  if ((m = fn.match(/^(\d{4})-(\d{4})\.(?:gif|png|jpg)$/i))) {
    return { kind: 'frame', from: +m[1], to: +m[2], openEnded: false, src, filename: fn };
  }
  // Frame with placeholder for the to-year (e.g. 1936-2xxx.gif, 2000-20xx.gif).
  // Any token containing "x" / "X" in the second component is open-ended.
  if ((m = fn.match(/^(\d{4})-([0-9xX]{2,4})\.(?:gif|png|jpg)$/i))) {
    if (/[xX]/.test(m[2])) {
      return { kind: 'frame', from: +m[1], to: null, openEnded: true, src, filename: fn };
    }
  }
  // Glyph: year + letter (e.g. 1697A.gif, 2000a.gif)
  if ((m = fn.match(/^(\d{4})([A-Za-z])\.(?:gif|png|jpg)$/i))) {
    return { kind: 'glyph', year: +m[1], letter: m[2], src, filename: fn };
  }
  return { kind: 'marker', src, filename: fn };
}

// Parse a per-letter page. HTML is HTML-3.2-style — no closing <TD>/<TR>.
// Row may include: standard mark (925.gif), cycle frame, glyph, optional commemorative (millenium.gif).
// We pick the first frame and first glyph; ignore markers.
function parseLetterPage(html, expectedLetter) {
  const rows = [];
  const tStart = html.search(/<TABLE[\s>]/i);
  const tEnd = html.search(/<\/TABLE>/i);
  if (tStart < 0 || tEnd < 0) return rows;
  const table = html.slice(tStart, tEnd);
  const chunks = table.split(/<TR[\s>]/i).slice(1);
  for (const chunk of chunks) {
    const imgs = [...chunk.matchAll(/<IMG[^>]*SRC=["']([^"']+)["']/gi)]
      .map(m => classifyImg(m[1].trim()));
    const frame = imgs.find(i => i.kind === 'frame');
    const glyph = imgs.find(i => i.kind === 'glyph');
    if (!frame || !glyph) continue;
    // Year column: first <TD> after the IMGs containing a 4-digit year.
    const yearMatch = chunk.match(/<TD>[^<]*(?:<A[^>]*>)?\s*(\d{4})/i);
    const year = yearMatch ? +yearMatch[1] : glyph.year;
    rows.push({ frame, glyph, year });
  }
  return rows;
}

// Bucket rows into cycles. Closed-range frames key by frame range; open-ended
// (2xxx) frames split by A-detection — every uppercase or lowercase 'A' marks a new cycle start.
function inferCycles(allRows) {
  const byKey = new Map();
  const openRows = [];
  for (const row of allRows) {
    if (!row.frame.openEnded) {
      const key = `${row.frame.from}-${row.frame.to}`;
      if (!byKey.has(key)) {
        byKey.set(key, { from: row.frame.from, to: row.frame.to, frame: row.frame, letters: [] });
      }
      byKey.get(key).letters.push(row);
    } else {
      openRows.push(row);
    }
  }
  if (openRows.length === 0) return [...byKey.values()];

  const aYears = [...new Set(
    openRows.filter(r => r.glyph.letter.toUpperCase() === 'A').map(r => r.year)
  )].sort((a, b) => a - b);
  const ranges = aYears.length > 0
    ? aYears.map((start, i) => ({ from: start, to: i + 1 < aYears.length ? aYears[i + 1] - 1 : null }))
    : [{ from: openRows[0].frame.from, to: null }];

  const openFrame = openRows[0].frame;
  for (const row of openRows) {
    const range = ranges.find(r => row.year >= r.from && (r.to == null || row.year <= r.to));
    if (!range) continue;
    const toLabel = range.to == null ? 'present' : range.to;
    const key = `${range.from}-${toLabel}`;
    if (!byKey.has(key)) {
      byKey.set(key, { from: range.from, to: range.to, frame: openFrame, letters: [] });
    }
    byKey.get(key).letters.push(row);
  }
  return [...byKey.values()];
}

async function processOffice(office) {
  console.log(`\n=== ${office} ===`);
  const indexUrl = `${BASE}/${office}.html`;
  const indexHtmlPath = path.join(RAW, office, '_index.html');
  const html = await cachedHtml(indexUrl, indexHtmlPath);
  const letters = parseOfficeIndex(html, office);
  console.log(`  ${letters.length} letter pages`);

  const allRows = [];
  const seenRow = new Set();
  for (const { letter, url } of letters) {
    const cachePath = path.join(RAW, office, `letter-${letter}.html`);
    let pageHtml;
    try { pageHtml = await cachedHtml(url, cachePath); }
    catch (e) { console.log(`  ! ${letter}: ${e.message}`); continue; }
    const rows = parseLetterPage(pageHtml, letter);
    for (const row of rows) {
      // Dedupe by (year, letter, case): smm cross-lists I letters on the J page etc.
      const c = row.glyph.letter === row.glyph.letter.toUpperCase() ? 'U' : 'L';
      const key = `${row.year}|${row.glyph.letter.toUpperCase()}|${c}`;
      if (seenRow.has(key)) continue;
      seenRow.add(key);
      allRows.push({ ...row, letterPageUrl: url });
    }
  }
  console.log(`  ${allRows.length} (cycle, letter, year) tuples (deduped)`);

  const cycles = inferCycles(allRows).sort((a, b) => a.from - b.from);
  console.log(`  ${cycles.length} cycles`);

  // Download images. URLs on per-letter pages are relative to /Dates/<Office>/;
  // /Shared/ paths resolve via the HTTP layer (uses ../Shared/...).
  const officeImgBase = `${BASE}/${office}`;
  const seenImg = new Set();
  for (const cycle of cycles) {
    if (cycle.frame && !seenImg.has(`F:${cycle.frame.src}`)) {
      seenImg.add(`F:${cycle.frame.src}`);
      const dest = path.join(FRAMES, office.toLowerCase(), cycle.frame.filename);
      if (!dryRun) {
        try { await cachedImage(`${officeImgBase}/${cycle.frame.src}`, dest); }
        catch (e) { console.log(`  ! frame ${cycle.frame.src}: ${e.message}`); }
      }
    }
    for (const row of cycle.letters) {
      if (seenImg.has(`G:${row.glyph.src}`)) continue;
      seenImg.add(`G:${row.glyph.src}`);
      const caseTag = row.glyph.letter === row.glyph.letter.toUpperCase() ? 'U' : 'L';
      const dest = path.join(
        GLYPHS, office.toLowerCase(),
        `${row.year}-${row.glyph.letter.toUpperCase()}-${caseTag}.gif`
      );
      if (!dryRun) {
        try { await cachedImage(`${officeImgBase}/${row.glyph.src}`, dest); }
        catch (e) { console.log(`  ! glyph ${row.glyph.src}: ${e.message}`); }
      }
    }
  }

  const cycleArr = cycles.map(c => {
    const toLabel = c.to == null ? 'present' : c.to;
    return {
      key: `${c.from}-${toLabel}`,
      from: c.from,
      to: c.to,
      frame: c.frame ? `frames/${office.toLowerCase()}/${c.frame.filename}` : null,
      letters: c.letters.map(r => {
        const caseTag = r.glyph.letter === r.glyph.letter.toUpperCase() ? 'U' : 'L';
        return {
          year: r.year,
          letter: r.glyph.letter.toUpperCase(),
          case: caseTag,
          glyph: `glyphs/${office.toLowerCase()}/${r.year}-${r.glyph.letter.toUpperCase()}-${caseTag}.gif`,
          sourceUrl: r.letterPageUrl,
        };
      }).sort((a, b) => a.year - b.year || a.letter.localeCompare(b.letter)),
    };
  });

  const dataPath = path.join(DATA, `${office.toLowerCase()}.json`);
  if (!dryRun) {
    fs.mkdirSync(DATA, { recursive: true });
    fs.writeFileSync(dataPath, JSON.stringify({
      office,
      sourceSite: 'silvermakersmarks.co.uk',
      sourceIndex: indexUrl,
      cycles: cycleArr,
      tuplesCount: allRows.length,
    }, null, 2));
    console.log(`  wrote ${dataPath} (${cycleArr.length} cycles, ${allRows.length} tuples)`);
  } else {
    console.log(`  [dry-run] would write ${dataPath}`);
  }

  return { office, tuples: allRows.length, cycles: cycleArr.length };
}

function writeManifest(summaries) {
  const manifestPath = path.join(ROOT, 'MANIFEST.json');
  let existing = {};
  if (fs.existsSync(manifestPath)) {
    try { existing = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); }
    catch { existing = {}; }
  }
  existing.silvermakersmarks = {
    sourceSite: 'silvermakersmarks.co.uk',
    sourceOwner: 'David McKinley',
    sourceContact: 'silvermakersmarks.co.uk/contact-smm.php',
    licenseNote: 'Used with permission. Do not redistribute outside this tool.',
    fetchedAt: new Date().toISOString(),
    offices: summaries,
  };
  fs.writeFileSync(manifestPath, JSON.stringify(existing, null, 2));
  console.log(`\nwrote ${manifestPath}`);
}

function writeAttribution() {
  const p = path.join(ROOT, 'ATTRIBUTION.md');
  const body = `# Date letter image attribution

The pre-1975 date letter images and cycle frames in \`glyphs/\` and \`frames/\` are
sourced from **silvermakersmarks.co.uk**, used with permission of the site owner.

When displaying these images on user-facing pages, credit them as:

> Date letter images courtesy of [silvermakersmarks.co.uk](https://www.silvermakersmarks.co.uk/).

Refer users to silvermakersmarks.co.uk for makers' mark identification and any
hallmark questions outside this tool's coverage.

Do not redistribute these images outside this tool without separate permission.
`;
  fs.writeFileSync(p, body);
  console.log(`wrote ${p}`);
}

(async () => {
  fs.mkdirSync(RAW, { recursive: true });
  fs.mkdirSync(GLYPHS, { recursive: true });
  fs.mkdirSync(FRAMES, { recursive: true });
  fs.mkdirSync(DATA, { recursive: true });

  const offices = onlyOffice ? [onlyOffice] : ALL_OFFICES;
  const summaries = [];
  for (const office of offices) {
    if (!ALL_OFFICES.includes(office)) {
      console.log(`Unknown office: ${office}`);
      continue;
    }
    try {
      const summary = await processOffice(office);
      summaries.push(summary);
    } catch (e) {
      console.log(`! ${office} failed: ${e.message}`);
    }
  }

  if (!dryRun) {
    writeManifest(summaries);
    writeAttribution();
    writeCombined();
  }

  console.log('\ndone:', summaries);
})();

function writeCombined() {
  const combined = {};
  for (const office of ALL_OFFICES) {
    const p = path.join(DATA, `${office.toLowerCase()}.json`);
    if (!fs.existsSync(p)) continue;
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    combined[office.toLowerCase()] = { office: d.office, cycles: d.cycles };
  }
  const out = path.join(DATA, 'cycles.json');
  fs.writeFileSync(out, JSON.stringify(combined));
  console.log(`wrote ${out} (${Object.keys(combined).length} offices)`);
}
