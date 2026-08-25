# Website Design System & AI Style Guide
### FlipperHelper — flipperhelper.app

**Version:** 1.2 · Reverse-engineered 25 August 2026
**Source of truth:** `flipperhelper-site-v14.html` (homepage), `blog-index-v2.html` (blog index), `flipperhelper-blog-android-backup-v3.html` (article template)
**Status:** Descriptive, not prescriptive-new. Every value below was read out of the actual CSS. Anything not directly readable is explicitly marked **[estimated]** or **[inferred]**.

**What changed in v1.1 / v1.2.** v1.0 documented three files that had drifted apart. Those divergences are now *resolved in the source files* rather than merely recorded, and this document describes the resolved state. v1.2 additionally makes the **navigation and footer fully canonical** — all three pages carry the homepage's nav verbatim (§6.1) and an identical footer (§6.12) — and reverts v1.1's narrowing of the article measure back to `900px` (§5.2). The full change log is in **Appendix A**. No design token, colour, radius, shadow, type size or spacing value has changed since v1.0 — the visual identity is intact.

> **Purpose of this document.** Another AI, which has never seen this website, must be able to read this file and build a brand-new page that looks and reads as if it had always been part of the site. Do not redesign. Do not modernise. Reproduce.

---

## Executive Summary — the design language in 10 points

1. **It is the app, on the web.** The palette, the shadow recipe and the page background are lifted verbatim from the FlipperHelper mobile app (`--bg:#F8FAFB` is commented "same as the app"; `--neu` is commented "NEUMORPHISM1 — exactly as in the app"). The website is not a marketing skin over a product — it is the product's own surface, extended.
2. **Soft neumorphism on an off-white ground.** Nothing is flat and nothing is heavy. Cards are white on `#F8FAFB` with a two-sided shadow — a warm grey drop bottom-right, a white lift top-left. There is no dark mode, no dark section, no colour-block hero.
3. **Two typefaces with two jobs.** `Roboto Flex` carries everything human (headings, body, buttons). `Roboto Mono` carries everything machine (labels, dates, amounts, badges, statuses, SKU-like metadata). The split is absolute and it is the single strongest identity signal on the site.
4. **Dashed lines everywhere.** Dividers, table rules, ledger rows, the timeline spine, the footer split, the tear-off `<hr>` — all dashed or dotted, all built from gradients rather than borders. This is a deliberate paper/receipt/ledger metaphor.
5. **The receipt is the signature object.** Cream paper (`#FDFBF4`), monospace, rotated `-1.4deg`, with a torn perforated bottom edge. It is the hero prop and the emotional core of the brand: *"the maths most of us skip."*
6. **Three semantic colours, used sparingly.** Orange `#E58025` = act on this. Blue `#1E76F1` = navigate / interactive / selected. Green `#32D347` = money you actually made. Periwinkle `#BBCBF7` = passive metadata. No colour is decorative.
7. **Content-first density.** Wide but bounded (1080px frame / 1032px content), generous 68px section rhythm, one 18px grid gap for practically every grid on the site. Whitespace is structural, never empty for effect.
8. **Editorial, first-person, evidence-led voice.** Real numbers, real names, real reviews, real failures. "Built at the car boot, not in a boardroom." No superlatives, no growth-hacking language, no invented statistics.
9. **Motion is a whisper.** One fade-and-rise-14px reveal on scroll, 2–4px hover lifts, 0.12–0.18s transitions. `prefers-reduced-motion` kills all of it globally in the very first block of CSS.
10. **Honesty as a design principle.** Pricing says free and means it. Reviews are unedited. Competitor comparisons are fair. The design supports this — nothing is hidden behind a hover, an interstitial, or a "learn more".

---

---

# PART 1 — DESIGN SYSTEM

---

## 1. Brand & Visual Identity

### 1.1 Brand positioning

FlipperHelper is a **free inventory and real-profit tracker for resellers who source in person** — car boots, charity shops, flea markets, France runs. It is deliberately *not* a cross-lister. The site positions the product against a spreadsheet, not against a competitor.

The three positioning pillars appear as the `.trust-trio` on every conversion surface and never change wording:

- Works offline at the market
- 10 seconds per find
- Real profit after every fee

### 1.2 Brand personality

| Trait | How it shows up |
|---|---|
| **Honest** | Unedited store reviews (including a 4-star average shown as 4.6, not rounded up). Fair competitor comparison. "Everything that's free today stays free." |
| **Grounded** | Founder's real business numbers, named wife/lead tester, named city, a bacon roll in the copy. |
| **Practical** | Every feature is introduced through the problem it solves at 05:50 in a muddy field. |
| **Craftsman-like** | CSS carries explanatory comments about why a shadow was tightened. The care is visible. |
| **Quietly confident** | No exclamation marks in body copy, no "revolutionary", no urgency timers. |

### 1.3 Visual character

- **Sophistication:** high, but *understated*. It reads as designed-by-someone-who-cares, not as agency-polished.
- **Minimalism:** medium-high. Very few elements, but each section is content-rich.
- **Visual density:** medium. Dense inside cards, generous between sections.
- **Modern vs traditional:** modern construction (CSS grid, clamp, backdrop-filter) expressing a traditional metaphor (paper, receipts, ledgers, market stalls).
- **Premium vs playful:** premium-tactile. Never playful, never corporate.
- **Technical:** visible but friendly — the monospace layer implies precision without demanding literacy.

### 1.4 What makes it visually distinctive

1. The **rotated cream receipt** with a perforated `radial-gradient` tear edge.
2. The **absolute mono/sans split** — machine data vs human prose.
3. **Dashed everything** — no solid rules anywhere except the `--line` hairlines at card and section boundaries. The dashed `.tear` is the standard divider between major sections (5× on the homepage, 8× in the article).
4. The **two-sided neumorphic shadow** that never becomes a glossy card.
5. The **timeline of one real Sunday** as the primary information architecture, instead of a feature grid.

### 1.5 Design principles that appear consistently

- One frame (1080px), one gap (18px), one card radius (14px).
- Every colour is semantic; nothing is chosen for looks.
- Monospace = data, sans = language. Never mixed inside one role.
- Structure is white cards on off-white ground; emphasis is a 4px orange stripe or a 3px orange left border. Never a filled coloured panel.
- Interactions lift, they do not glow, scale dramatically, or change colour scheme.

---

## 2. Colour System

All values are read verbatim from the `:root` block, which is **byte-identical across all three files**. Treat this block as immutable.

### 2.1 Core brand colours

| Token | Name | HEX | RGB | Where used | Purpose |
|---|---|---|---|---|---|
| `--accent` | Action Orange | `#E58025` | 229, 128, 37 | Primary buttons, eyebrow labels, `.pro-card`/`.post-cta`/`.featured` 4px stripe, `.rule` 3px left border, review stars, `.status-next`, waitlist label, hero radial glow | "Act / this is ours". The app's *Add New Item* orange. **The brand's signature colour.** |
| `--accent-hover` | Orange Hover | `#F08F38` | 240, 143, 56 | `.btn-primary:hover` background only | Lighter, warmer hover — never used as a static fill |
| `--action` | App Blue | `#1E76F1` | 30, 118, 241 | All links, FAQ `+`/`–`, timeline dots and `.when` labels, focus outlines, carousel arrows, active filter pills, `::selection`, `.rev-more`, `.backlink`, step numbers | "Interactive / selected". Never used as a large fill. |
| `--profit` | Profit Green | `#32D347` | 50, 211, 71 | `.trust-trio` dots, `.ledger-row .amt`, `.pro-foot` dot, `.status-building` dot, waitlist success dot | "Money you actually made." Dots and bold numerics only — see §2.6. |
| `--cat` | Periwinkle | `#BBCBF7` | 187, 203, 247 | `.chip` border, `.post-tag`/`.art-tag`/`.rev-store` badge backgrounds, `.ledger h3` label pill, `.shot figcaption`, prose bullet markers, `.cmp thead`, `.rev-reply` border, step-number border | **Passive metadata.** The rule: periwinkle is never clickable. |
| `--loss` | Loss Red | `#E14B4B` | 225, 75, 75 | `input[aria-invalid="true"]` border and outline | Error only. Not used anywhere in editorial content. |

### 2.2 Surfaces & ink

| Token | Value | Used for |
|---|---|---|
| `--bg` | `#F8FAFB` | Page background, `.ledger` fill, timeline dot centre, `.story` outer band contrast |
| `--card` | `#FFFFFF` | Every card, the footer, `.story` band, inputs, `.btn-ghost`, `.badge-card` |
| `--ink` | `#000000` | H1/H2/H3, `<strong>`, nav active link, FAQ summary, `.pro-row .k`, table first column |
| `--ink-66` | `rgba(0,0,0,.66)` | **Default body text (set on `body`)**, all paragraphs, footer links, chip text |
| `--ink-45` | `rgba(0,0,0,.45)` | Metadata: dates, read time, `.group-label`, `.foot-col h4`, captions, fine print, inactive nav (via `opacity:.45`) |
| `--ink-30` | `rgba(0,0,0,.30)` | Input placeholders, `.post-side .post-date` on the blog index |
| `--line` | `rgba(0,0,0,.08)` | Card borders, nav bottom border, footer top border, FAQ row dividers |
| `--line-strong` | `rgba(0,0,0,.14)` | Dashed rules, `.btn-ghost` border, input borders, tear pattern, `.tear` |

### 2.3 Literal (non-tokenised) colours — the receipt and icon layer

These appear as raw hex in component CSS. They are **intentional exceptions**, not sloppiness. Reuse them only in their original component.

| HEX | Where | Purpose |
|---|---|---|
| `#FDFBF4` | `.receipt` background + tear teeth | Cream till-roll paper |
| `#26241E` | `.receipt` text, `.r-total` top border | Warm near-black receipt ink |
| `#8B8676` | `.receipt .r-sub`, `.r-note` | Faded thermal print |
| `#B9B4A3` | `.receipt .r-dash` border | Faded dashed rule on paper |
| `#1B9A34` | `.receipt .r-total td:last-child` | Darker green — legible on cream |
| `#A4433B` | `.receipt .r-neg` | Muted red for outgoings on paper |
| `#1FA234` | `.ic-profit` icon, `.status-building` text, `.cmp tr.highlight-col td` | **Accessible green for text.** Use this, never `--profit`, when green must be readable at body size. |
| `#EDF1F5` / `#F4F7FA` | `.shot .ph` diagonal stripes | Screenshot placeholder only — remove when real screenshots ship |

### 2.4 Tinted state backgrounds

Built as `rgba()` of a brand colour at very low alpha. This is the only sanctioned way to fill an area with colour.

| Value | Component |
|---|---|
| `rgba(50,211,71,.13)` | `.ic-profit` icon container |
| `rgba(50,211,71,.14)` | `.status-building` pill |
| `rgba(229,128,37,.13)` | `.ic-speed` icon container |
| `rgba(229,128,37,.12)` | `.status-next` pill |
| `rgba(30,118,241,.11)` | `.ic-data` icon container |
| `rgba(30,118,241,.07)` | `.filters button[aria-pressed="true"]` |
| `rgba(187,203,247,.14)` | `.rev-reply` (developer reply block) |
| `rgba(229,128,37,.08)` → transparent | `.hero::before` radial glow |
| `rgba(248,250,251,.86)` | `.nav` translucent bar (with `blur(14px)`) |

### 2.5 Interaction-state colour map

| State | Rule |
|---|---|
| Link default | `--action`, no underline |
| Link hover | `--action`, underline appears |
| Primary button hover | background → `--accent-hover`; no transform |
| Ghost button hover | border → `--action`, text → `--action` |
| Nav link default | `#000` at `opacity:.45` |
| Nav link hover / `[aria-current="page"]` / `.active` | `#000` at `opacity:1` |
| Card hover (`.shot`) | `translateY(-4px)` |
| Card hover (`.badge-card`, `.featured`) | `translateY(-2px)` + border → `--line-strong` |
| Row hover (`.post-row`) | gains `--card` bg + `--neu-soft` + `scale(1.012)`; title → `--action` |
| Active/pressed (all buttons) | `translateY(1px)` + shadow collapses to `2px 2px 8–14px` |
| Focus-visible (global) | `outline:2px solid var(--action); outline-offset:3px; border-radius:6px` |
| Focus-visible (buttons) | same, `outline-offset:2px` |
| Focus (inputs) | `outline:2px solid var(--action); outline-offset:1px; border-color:transparent` |
| Invalid input | `border-color:var(--loss)` + `outline-color:var(--loss)` |
| Disabled | **No disabled style exists in CSS.** The only disabled state is JS-set on the waitlist button, which also swaps the label to "Joining…". Follow that pattern: change the label, don't rely on a visual token. |
| Success | Green dot + bold `--ink` text (`.waitlist .ok`) — no green banner, no toast |
| Warning | **Does not exist on this site.** Do not invent one. |

### 2.6 Measured contrast — read this before using colour on text

Values computed against `--bg #F8FAFB` or `#FFF` as noted. **[computed, ±0.05]**

| Combination | Ratio | Verdict |
|---|---|---|
| `--ink` on `--bg` | ~19.5:1 | ✅ |
| `--ink-66` on `--bg` | ~7.2:1 | ✅ AA/AAA body |
| `--ink-45` on `--bg` | ~3.3:1 | ⚠️ Below AA for body. Only ever used at ≥12px mono metadata — acceptable in context, but never promote it to paragraph text. |
| `--ink-30` on `--card` | ~2.2:1 | ⚠️ Placeholders only. |
| `--action` on `#FFF` | ~4.3:1 | ⚠️ Marginally under 4.5:1 AA. Passes for ≥18.66px bold / ≥24px. Acceptable for links (underlined on hover, plus other cues) — **flagged as the site's weakest contrast point.** |
| `#FFF` on `--accent` | ~2.8:1 | ❌ Fails AA. This is the primary button. **Do not fix it by changing the button** — that would break the brand. Compensate: keep primary button labels ≥16px semibold, always pair with adjacent `--ink-66` supporting text, and never make an orange-on-white *text link*. |
| `--accent` as text on `--bg` | ~2.8:1 | ❌ Used for `.eyebrow` (12px uppercase mono). Treat eyebrows as decorative labels that always duplicate information present in the adjacent H2. Never put unique information in an eyebrow. |
| `--profit` on `#FFF` | ~1.9:1 | ❌ Never use as text colour except large bold numerics in `.ledger-row .amt`. For readable green text use `#1FA234` (~3.9:1 — still large-text only). |

---

## 3. Typography System

### 3.1 Families

```css
--font-body:'Roboto Flex', -apple-system, 'Helvetica Neue', Arial, sans-serif;
--font-mono:'Roboto Mono','SF Mono',ui-monospace,Menlo,monospace;
```

Loaded from Google Fonts with `preconnect` to both `fonts.googleapis.com` and `fonts.gstatic.com`:

```
Roboto Flex: opsz 8..144, weights 400,500,600,700,800
Roboto Mono: weights 400,500,600
display=swap
```

**Weights actually used:** 400 (body, section lede), 500 (brand, nav, trust-trio), 600 (buttons, strong, labels, mono everything), 700 (h1–h3 default, card titles, pull-quotes), 800 (page-level H1 only).
Mono is **never** used above 600 and never above `--fs-h3-lg` (20px).

### 3.2 The type scale (one ladder, whole site)

| Token | rem | px @16 | Canonical use |
|---|---|---|---|
| `--fs-3xs` | `.68rem` | 10.9 | Micro mono: status pills, `.foot-col h4`, `.rev-more`, `.f-more`, table `th`, filter pills, `.rev-meta` |
| `--fs-2xs` | `.75rem` | 12 | Eyebrow, `.group-label`, dates, `.when`, chips, footnotes, `.foot-bottom` |
| `--fs-xs` | `.85rem` | 13.6 | Nav links, footer links, receipt body, `.rev-text`, hints, `.cmp tbody th` |
| `--fs-sm` | `.95rem` | 15.2 | Card body text, FAQ answers, `.ledger-row`, `.post-row p`, table cells |
| `--fs-base` | `1rem` | 16 | Buttons, brand wordmark, `.faq summary`, `.moment .scene/.answer`, `.post-row h2` |
| `--fs-md` | `1.0625rem` | 17 | **`body` default — all long-form prose** |
| `--fs-lede` | `1.125rem` | 18 | `.section-lede`, `.hero-sub`, `.art-lede`, `.rule` pull-quotes, `.prose h3` |
| `--fs-h3` | `1.05rem` | 16.8 | `.today-card h3`, `.bench-card h3`, `.newsletter h3`, carousel arrow glyph |
| `--fs-h3-lg` | `1.25rem` | 20 | `.pro-card h3`, `.featured h2`, `.post-cta h2`, `.rev-summary .score` |
| `--fs-xl` | `1.2rem` | 19.2 | FAQ `+`/`–` marker only |
| *(one-off)* | `.62rem` | 9.9 | `.rev-store`, `.post-tag`, `.art-tag`, `.post-side .post-date` — the smallest badge text. Not tokenised; reuse the literal. |

### 3.3 Heading specification

Global base (applies to `h1,h2,h3`):
```css
font-family:var(--font-body); color:var(--ink);
line-height:1.16; font-weight:700; letter-spacing:-.015em;
```

| Level | Size | Weight | Tracking | Line-height | Notes |
|---|---|---|---|---|---|
| **H1 — homepage hero** | `clamp(2.2rem, 5vw, 3.4rem)` → 35.2–54.4px | 800 | `-.025em` | 1.16 | `margin-bottom:18px`. `<em>` inside is `font-style:normal; color:var(--profit)` — the *only* place profit green is used at display size. |
| **H1 — inner page** (`.page-head h1`, `.post h1`) | `clamp(2rem, 4.4vw, 2.8rem)` → 32–44.8px | 800 | `-.02em` | 1.16 | `margin-bottom:12px`; `max-width:760px` on `.page-head` |
| **H2 — section title** (`.section-title`) | `clamp(1.8rem, 3.6vw, 2.4rem)` → 28.8–38.4px | 700 | `-.02em` | 1.16 | `margin-bottom:12px`. Always preceded by an `.eyebrow`. |
| **H2 — final CTA** (`.final h2`) | `clamp(1.9rem, 4vw, 2.6rem)` → 30.4–41.6px | 700 | `-.02em` | 1.16 | `margin-bottom:14px`, centred |
| **H2 — in-article** (`.post h2`, `.prose h2`) | `clamp(1.35rem, 2.6vw, 1.6rem)` → 21.6–25.6px | 700 | `-.015em` | 1.16 | `.post h2` → `margin-bottom:14px`; `.prose h2` → `margin:44px 0 14px` |
| **H2 — card-level** (`.featured h2`, `.post-cta h2`) | `--fs-h3-lg` 20px | 700 | `-.01em` | 1.16 | Inside a bordered card |
| **H3 — timeline moment** (homepage) | `clamp(1.25rem, 2.4vw, 1.5rem)` → 20–24px | 700 | `-.015em` | 1.16 | `max-width:560px`, `margin-bottom:12px` |
| **H3 — card title** | `--fs-h3` 16.8px | 700 | `-.015em` | 1.16 | `.today-card`, `.bench-card`, `.newsletter` |
| **H3 — pro/feature card** | `--fs-h3-lg` 20px | 700 | `-.01em` | 1.16 | `margin-bottom:8px` |
| **H3 — article sub-section** | `--fs-lede` 18px | 700 | `-.015em` | 1.16 | `.post h3{margin:26px 0 8px}` / `.prose h3{margin:26px 0 8px}` |
| **H3 — receipt title** | `--fs-xs` 13.6px **mono** | 600 | `.12em` | — | UPPERCASE, centred. Deliberate inversion of the heading rule. |
| **H4 — footer column** | `--fs-3xs` 10.9px **mono** | 600 | `.14em` | — | UPPERCASE, `--ink-45`, `margin:4px 0 6px` |

### 3.4 Body & prose specification

| Role | Family | Size | Weight | Line-height | Colour | Spacing |
|---|---|---|---|---|---|---|
| Body default (`body`) | body | 17px | 400 | 1.6 | `--ink-66` | — |
| Article paragraph | body | 17px | 400 | 1.6 | `--ink-66` | `margin-bottom:16px` |
| Section lede | body | 18px | 400 | 1.6 | `--ink-66` | `max-width:600px`, `margin-bottom:38px` |
| Hero sub | body | 18px | 400 | 1.6 | `--ink-66` | `max-width:530px`, `margin-bottom:30px`; `<strong>` → `--ink` 600 |
| Article lede (`.art-lede`) | body | 18px | 400 | 1.6 | `--ink-66` | `max-width:720px`, `margin:0 0 26px` |
| Card body | body | 15.2px | 400 | **1.55** | `--ink-66` | Tighter leading than prose — deliberate density inside cards |
| Review text | body | 13.6px | 400 | **1.5** | `--ink-66` | Densest text on the site |
| Emphasis inside prose | body | inherit | **600** | — | `--ink` | `<strong>` always both darkens *and* bolds. Never one without the other. |
| List item | body | 17px | 400 | 1.6 | `--ink-66` | `padding-left:22px`, `margin-bottom:9px`, custom 6px periwinkle dot at `left:4px; top:.58em` |

### 3.5 The monospace layer — complete inventory

Every one of these is `--font-mono`, weight 600 unless noted, and almost always UPPERCASE with wide tracking.

| Component | Size | Tracking | Transform | Colour |
|---|---|---|---|---|
| `.eyebrow` | 12px | `.14em` | uppercase | `--accent` (`--action` inside `#day`) |
| `.group-label` | 12px | `.14em` | uppercase | `--ink-45`, `<b>` → `--ink` |
| `.waitlist-label` | 12px | `.14em` | uppercase | `--accent` |
| `.foot-col h4` | 10.9px | `.14em` | uppercase | `--ink-45` |
| `.moment .when` | 12px | `.14em` | uppercase | `--action` |
| `.status` pill | 10.9px | `.12em` | uppercase | per-variant |
| `.author-card .a-label` | 10.9px | `.12em` | uppercase | `--ink-45` |
| `.receipt h3` | 13.6px | `.12em` | uppercase | `#26241E` |
| `.pro-row .k` | 12px | `.1em` | uppercase | `--ink` |
| table `th` | 10.9px | `.1em` | uppercase | `--ink-45` (`.ledger-table`) / `--ink` on `--cat` (`.cmp`) |
| `.shot figcaption` | 12px | `.08em` | uppercase | `--ink` on `--cat` |
| `.rev-store`, `.post-tag`, `.art-tag` | 9.9px | `.09em` | uppercase | `--ink-66` on `--cat` |
| `.rev-meta`, `.rev-reply b` | 10.9px | `.08em` | (b: uppercase) | `--ink-45` |
| `.rev-more`, `.f-more` | 10.9px | `.08em` | — | `--action` |
| `.backlink`, `.post-back` | 12px | `.08em` | — | `--action` |
| `.post-date`, `.art-date`, `.art-read` | 12px | — | — | `--ink-45` + `tabular-nums` |
| `.chip` | 12px | — | lowercase | `--ink-66` |
| `.filters button` | 10.9px | — | — | `--ink-66` |
| `.rev-summary .score` | 20px | `-.01em` | — | `--ink` + `tabular-nums` |
| `.ledger-row .amt` | 15.2px, **700** | — | — | `--profit` + `tabular-nums` |
| `.brand-mark` | 10.9px | — | — | `#FFF` on `--accent` |

**Rule:** any number that is a *quantity* (money, dates, counts, ratings) gets `font-variant-numeric:tabular-nums`.

### 3.6 Mobile typography

There is **no separate mobile type scale.** All display sizes are `clamp()`-driven and shrink fluidly with viewport width. Only two explicit changes exist:

- `@media(min-width:720px)` — `.trust-trio` becomes `clamp(.8rem,1.2vw,.9rem)` and `nowrap`. Below 720px it reverts to a flat `--fs-sm` and wraps.
- Everything else: body, cards, badges and labels keep identical sizes on mobile and desktop.

**Why this works:** the fixed small sizes are already at a comfortable mobile minimum (12px+ for metadata, 15.2px+ for content), and the fluid headings do the adaptive work. Do not add mobile-specific font-size overrides.

### 3.7 Hierarchy logic

Emphasis is created in this order, and you should reach for them in this order:

1. **Size + weight 800** (page H1) — one per page, no exceptions.
2. **The eyebrow → H2 → lede triad** — a mono orange label, a large tight heading, an 18px 600px-wide lede. This triad opens virtually every section.
3. **Colour on a single word** — `<em>` in the hero H1, `<strong>` in prose (→ `--ink` 600).
4. **A card with a 4px orange stripe** — marks the one block on the page that matters most.
5. **Mono uppercase labels** — signal "this is data, scan it, don't read it".

Never use more than one level-4 orange-stripe card per page.

---

## 4. Spacing System

### 4.1 The derived scale

Reverse-engineered from actual usage frequency. These are the real values; the names are the documentation layer.

| Name | Value | Primary role |
|---|---|---|
| **3XS** | `4px` | Icon-to-dot offsets, `.shots` side padding, `.foot-col h4` top margin |
| **2XS** | `6px` | Badge vertical padding, `.newsletter h3` bottom, small radii |
| **XS** | `8px` | Brand gap, `.chip-row` gap, `.trust-trio` icon gap, `.foot-left p` top, `.moment .when` bottom |
| **S** | `10–12px` | Button icon gap (10), `.eyebrow` bottom (12), `.section-title` bottom (12), `.newsletter` form gap (10), `.pro-card h3` bottom (8–12) |
| **M** | `18px` | **The universal gap.** All grid gaps, `.store-row`, `.nav-links`, carousel gaps, `.group-label` bottom, `.pro-foot` top, `.faq p` bottom |
| **L** | `22px` | Standard card padding, `.receipt` side padding, `.backlink` bottom, `.badge` internal, `.bench-note` top |
| **XL** | `26px` | `.pro-card`/`.post-cta` vertical padding, `.prose h3` top margin, `.art-lede` bottom, `.rule` vertical margin, footer top padding |
| **2XL** | `38–40px` | `.section-lede` bottom (38), `.newsletter` top padding (38), `.merged-gap` (40) |
| **3XL** | `44–48px` | `.prose h2` top (44), `.author-card` top (44), **mobile section padding (48)**, article section-to-section (48), `.moment` bottom padding (56) |
| **4XL** | `64–68px` | **Desktop section padding (68)**, `.hero-grid`/`.story-grid` gap (64), hero bottom (64) |
| **5XL** | `76px` | Hero top padding only |

### 4.2 Fixed structural spacing

| What | Desktop | ≤720px |
|---|---|---|
| `section` padding | `68px 0` | `48px 0` |
| `section#get` bottom | `46px` (carousel carries 22px internal) | `26px` |
| `.hero` padding | `76px 0 64px` | fluid (unchanged rule) |
| `.page-head` padding | `64px 0 0` | `44px 0 0` |
| `.post` padding | `68px 0` | `48px 0` |
| `.wrap` horizontal padding | `24px` | `24px` (unchanged) |
| `.badges` padding | `46px 0` | `34px 0` (≤520px) |
| `footer` padding | `26px 0 24px` | unchanged |
| `.nav-inner` padding | `8px 24px` | unchanged |

### 4.3 Component padding reference

| Component | Padding |
|---|---|
| `.btn` | `13px 22px` |
| `.nav .btn` | `5px 11px` |
| `.today-card`, `.bench-card`, `.author-card` | `22px` |
| `.pro-card`, `.featured`, `.post-cta` | `26px 22px` |
| `.rev-card` | `18px` |
| `.shot` | `12px` |
| `.ledger` | `30px` |
| `.ledger-table` | `6px 22px` |
| `.receipt` | `28px 26px 20px` |
| Inputs (email, newsletter) | `13px 16px` |
| `.blog-search input` | `9px 14px 9px 36px` (36px left clears the icon) |
| `.badge-card` | `8px 12px`, `min-height:56px` |
| `.chip` | `5px 12px` |
| `.status` pill | `5px 12px` |
| `.post-tag` / `.art-tag` / `.rev-store` | `4px 8px` |
| `.filters button` | `5px 10px` |
| `.post-row` | `16px 18px` with `margin:0 -18px` (bleeds the hover card past the list edge) |
| `.rev-reply` | `10px 12px` |
| `.faq summary` | `17px 2px` |
| `.cmp th/td` | `14px 18px` |

### 4.4 Vertical rhythm inside prose

Documented in the article CSS comment and confirmed in code:

```
68px  page padding (top/bottom)
48px  between article <section>s, and .post hr.tear margin
44px  .prose h2 top margin (blog-index prose variant)
26px  h3 top margin · pull-quote margin · store-row margin
22px  back-link bottom · card padding
16px  paragraph bottom margin
14px  h2 bottom margin
 9px  list-item bottom margin
 8px  h3 bottom margin
```

**Heading-to-body:** H2 → 14px, H3 → 8px. Body → next H2: 44–48px. This 3:1 ratio between "space above a heading" and "space below it" is what makes the article scannable. Preserve it.

### 4.5 Mobile spacing changes

Only three things change:

1. Section padding `68 → 48`.
2. `.moment` left padding `56 → 40` (≤600px), tightening the timeline.
3. `.post-row` padding `16px 18px → 14px 14px` with matching negative margin (≤640px).

Everything else — card padding, gaps, button padding — is identical on mobile. **Do not shrink card padding on mobile.**

---

## 5. Grid & Layout System

### 5.1 The frame

```css
--max: 1080px;
.wrap{ max-width:var(--max); margin:0 auto; padding:0 24px }
```

→ **Maximum content width = 1032px.** Every `.wrap`, the nav inner, the footer grid and the `.tear` rule share this exact frame. The frame never changes across pages.

### 5.2 Text measures — the two-tier system

| Measure | Value | Applies to |
|---|---|---|
| Full frame | 1032px | Headings, cards, tables, grids, CTA blocks |
| `--measure` | **900px** | All article body text, lists, quotes and tables |
| Lede measure | 600px | `.section-lede` |
| Hero sub | 530px | `.hero-sub` |
| Moment text | 560px | `.moment h3/.scene/.answer` |
| FAQ | 760px block, 640px answers | `.faq` |
| Pro intro / bench note | 640px | `.pro-intro`, `.bench-note` |
| Final CTA paragraph | 520px | `.final p`, `.newsletter` |
| Footer intro | 300px | `.foot-left p` |

> **Resolved in v1.2.** v1.0 found the two article stylesheets disagreeing — `--measure:900px` in the standalone article, `720px` in the blog-index copy. The duplicate was the problem, not the value: the blog index was shipping a second, unused copy of the article stylesheet. That copy is gone, so **900px is now the single article measure**, exactly as the article template always had it.
>
> v1.1 briefly narrowed this to 720px on reading-measure grounds. That was reverted — the wider column is the intended look, and line length is the site owner's call, not a consistency fix.
>
> **Rule for new pages:** there is one article measure — `--measure:900px`. Do not introduce a second. Headings are *not* bound by it; they span the full 1032px frame, and the contrast between wide headings and the 900px text column is deliberate.

### 5.3 Grids in use

| Grid | Desktop | Breakpoint | Mobile |
|---|---|---|---|
| `.hero-grid` | `1.1fr .9fr`, gap 64px | ≤920px | `1fr`, gap 48px |
| `.story-grid` | `1fr 1fr`, gap 64px | ≤920px | `1fr`, gap 44px |
| `.today-grid` | `repeat(3,1fr)`, gap 18px | ≤860px | `1fr` |
| `.bench-grid` | `repeat(3,1fr)`, gap 18px | ≤860px | `1fr` |
| `.pro-row` | `190px 1fr`, gap `8px 24px` | ≤640px | `1fr`, gap 4px |
| `.foot-grid` | `1.6fr 1fr 1fr 1fr`, gap 24px | ≤860px → `1fr 1fr`; ≤520px → `1fr` | stacked |
| `.post-row` | `1fr auto`, gap `8px 26px` | ≤640px | `1fr`, meta row moves to `order:-1` |

**Asymmetry is used exactly twice** — the hero (`1.1fr .9fr`) and the footer (`1.6fr 1fr 1fr 1fr`). Everywhere else is symmetrical. Do not introduce new asymmetric grids.

### 5.4 Horizontal carousels

Two exist, both built the same way:

```css
display:flex; gap:18px; overflow-x:auto; padding:8px 4px 22px;
scroll-snap-type:x mandatory | proximity;
-webkit-overflow-scrolling:touch; scrollbar-width:none;
::-webkit-scrollbar{display:none}
```

- `.shots` — fixed `240px` cards (`200px` ≤520px), `mandatory` snap.
- `.revs` — `flex:0 0 calc((100% - 36px)/3)` → **exactly 3 cards per viewport**, `proximity` snap, `280px` fixed ≤860px.

Arrows sit in a `.carousel-head` / `.rev-head` flex row: content left, arrows right, `align-items:flex-end`, `flex-wrap:wrap`.

### 5.5 Full-width vs contained

Only **three** elements break the 1032px frame:

1. `.nav` — full-bleed sticky bar with a contained `.nav-inner`.
2. `.story` — a full-bleed white band (`background:var(--card)` + hairline top/bottom borders) with contained content. **This is the only background-colour change in the entire page flow.**
3. `footer` — full-bleed white with contained grid.

Everything else lives inside `.wrap`. There are no full-bleed images, no edge-to-edge hero, no coloured section bands.

### 5.6 Vertical rhythm at page level

```
nav (sticky)
hero          76 / 64
section       68
section       68   ← optionally padding-top:0 when it continues the previous idea
.tear         (hairline dashed separator, used between major narrative shifts)
.story band   68 + background change
section       68
final         68 (centred)
.badges       46
footer        26
```

`.tear` is the only decorative separator, and it is the **standard section divider**: 5 occurrences on the homepage, 8 in the article, 1 on the blog index. Rule of thumb — a `.tear` sits between major narrative units, but not between a section and its own continuation (the screenshots section uses `padding-top:0` instead, because it continues the timeline's idea).

---

## 6. UI Components

### 6.1 Header / Navigation (`.nav`)

**Purpose:** persistent wayfinding + always-available primary CTA.

```css
position:sticky; top:0; z-index:100;
background:rgba(248,250,251,.86); backdrop-filter:blur(14px);
border-bottom:1px solid var(--line);
.nav-inner{max-width:1080px;margin:0 auto;padding:8px 24px;display:flex;align-items:center;gap:22px}
```

- **Brand:** `.brand` — 19×20px SVG logo (`currentColor`, `--ink`) + wordmark "FlipperHelper" at `--fs-base`/500/`-.01em`, gap 8px, never underlined.
- **Links:** `.nav-links` — `margin-left:auto`, gap 18px. Each link: `--fs-xs`/500, `color:#000` at `opacity:.45`, `min-height:44px` (touch target), `transition:opacity .12s ease`. Active/hover → `opacity:1`.
- **CTA:** `.nav .btn` overrides to `padding:5px 11px; font-size:var(--fs-xs); border-radius:9px` — a deliberately smaller pill so it doesn't dominate the bar.
- **Mobile (≤860px):** `.nav-links a:not(.btn){display:none}`. **All text links vanish; only the brand and the orange CTA remain.** There is no hamburger, no drawer, no mobile menu. This is intentional — the homepage is a single scroll and the CTA is the only mobile-critical action.
- **Scroll-spy:** an `IntersectionObserver` adds `.active` to the nav link matching the section in view.

**Canonical navigation — identical on every page, no exceptions.**

Seven items, this order, these exact labels:

| # | Label | Homepage `href` | Every other page `href` |
|---|---|---|---|
| 1 | Your Sunday | `#day` | `/#day` |
| 2 | Our story | `#story` | `/#story` |
| 3 | What's next | `#workbench` | `/#workbench` |
| 4 | FAQ | `#faq` | `/#faq` |
| 5 | Blog | `/blog/` | `/blog/` |
| 6 | Free tools | `/tools/` | `/tools/` |
| 7 | **Get the App** (`.btn .btn-primary`) | `#get` | `/#get` |

**The only thing that varies between pages is the leading `/` on the four anchors** — they are in-page on the homepage and cross-page everywhere else. Labels, order and count never change.

Add `aria-current="page"` to the item matching the current page (`Blog` on the blog index and on any article). On the homepage the scroll-spy sets `.active` instead, at runtime.

Rules:
- **Do not add a nav item for a new page.** A new page earns a footer link, not a nav slot. The nav describes the homepage's story plus the two content hubs — that is its whole job.
- **Do not reorder.** Items 1–4 are the homepage narrative in scroll order; 5–6 are the content hubs; 7 is the CTA.
- There is no `Home` item — the brand lockup on the left is the home link.
- There is no `Compare` item. `/compare/` is reached from the FAQ answer and from article body copy, not from the nav.

> **Resolved in v1.2.** v1.0 found three different orders and label sets across the three files (`Tools` vs `Free tools`, FAQ in three different positions, a `Home` item on some pages but not others, and a `/#download` CTA anchor pointing at an id that does not exist on the homepage). v1.1 unified the two inner pages on their own order; v1.2 goes further and makes **all three pages carry the homepage's nav verbatim**, which is the table above. All cross-page links are root-absolute.

### 6.2 Buttons

**Base `.btn`:**
```css
display:inline-flex; align-items:center; gap:10px;
font-family:var(--font-body); font-weight:600; font-size:var(--fs-base); letter-spacing:.01em;
padding:13px 22px; border-radius:12px; cursor:pointer; border:1px solid transparent;
transition:transform .15s ease, background .15s ease, border-color .15s ease, box-shadow .15s ease;
text-decoration:none!important;
```
`:active` → `transform:translateY(1px); box-shadow:2px 2px 14px rgba(174,174,174,.4)`

| Variant | Background | Text | Border | Shadow | Hover |
|---|---|---|---|---|---|
| `.btn-primary` | `--accent` | `#FFF` | transparent | `--neu` | bg → `--accent-hover` |
| `.btn-ghost` | `--card` | `--ink` | `--line-strong` | `--neu-soft` | border + text → `--action` |
| `.nav .btn` | inherits variant | — | — | — | `5px 11px`, 13.6px, radius 9px |

**`.store-row`** — the App Store / Google Play pair. `display:flex; gap:18px; flex-wrap:wrap`. Inside it, buttons get a **tightened shadow**:
```css
box-shadow:4px 4px 14px rgba(174,174,174,.35), -4px -4px 14px rgba(255,255,255,.6);
```
The CSS comment explains why: shadow extent ≈ offset 4px + blur/2 = 11px, which is less than the 18px gap, so one button's glow never lands on its neighbour. **Apply this rule any time two shadowed elements sit within 18px of each other.**

Buttons always carry a small inline SVG store logo before the label, gap 10px.

### 6.3 Cards — the four variants

All cards share: `background:var(--card)`, `border:1px solid var(--line)`, `border-radius:var(--radius-md)` (14px).

| Variant | Padding | Shadow | Distinguishing feature | Used for |
|---|---|---|---|---|
| **Standard card** (`.today-card`, `.bench-card`, `.author-card`) | `22px` | `--neu-soft` | none | Feature triads, roadmap, author bio |
| **Emphasis card** (`.pro-card`, `.post-cta`, `.featured`) | `26px 22px` | `--neu` (stronger) | `::before` 4px `--accent` stripe, full height, `border-radius:4px 0 0 4px`; `position:relative; overflow:hidden` | The single most important block on a page |
| **Compact card** (`.rev-card`, `.shot`) | `18px` / `12px` | `--neu-soft` | `flex-direction:column`, fixed flex-basis for carousels | Carousel items |
| **Inset panel** (`.ledger`) | `30px` | `--neu-soft` | `background:var(--bg)` (not white), `border-radius:var(--radius-lg)` 20px, mono throughout | A data readout embedded in a white band |

**`.today-card` icon container (`.today-ic`):** 46×46px, `border-radius:12px`, `display:grid; place-items:center`. SVG inside is 23×23, `stroke:currentColor; fill:none; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round`. Three colour variants only: `.ic-profit` / `.ic-speed` / `.ic-data`.

### 6.4 Chips, badges, tags & pills — the four kinds

| Kind | Class | Look | Meaning |
|---|---|---|---|
| **Outline chip** | `.chip` | `1.5px solid var(--cat)` on `--card`, `border-radius:999px`, mono 12px lowercase `--ink-66`, padding `5px 12px` | Feature keywords under a timeline moment. Never clickable. |
| **Filled tag** | `.post-tag`, `.art-tag`, `.rev-store` | `background:var(--cat)`, `border-radius:6px`, mono 9.9px UPPERCASE `--ink-66`, padding `4px 8px` | Category / source metadata. Never clickable. |
| **Status pill** | `.status` + `.status-building` / `.status-next` / `.status-idea` | `border-radius:999px`, mono 10.9px `.12em` uppercase, padding `5px 12px`, tinted bg, leading 6px `currentColor` dot | Roadmap state. `.status-building i` pulses (`@keyframes pulse`, 1.6s). |
| **Interactive pill** | `.filters button` | `--card` bg, `1px solid var(--line-strong)`, `border-radius:999px`, `--neu-soft`, mono 10.9px, padding `5px 10px` | The *only* pill you may click. Hover/selected → `--action` border+text; `[aria-pressed="true"]` also gets `rgba(30,118,241,.07)` fill. |

**The rule this encodes:** periwinkle (`--cat`) = inert metadata; blue (`--action`) = interactive. Never build a clickable periwinkle chip.

### 6.5 Forms & inputs

Two input recipes exist; both share the **inset neumorphic** treatment that makes a field look pressed into the surface.

**Standard field** (`.waitlist-form input`, `.newsletter input`):
```css
padding:13px 16px; font-size:var(--fs-base)|var(--fs-sm);
background:var(--card); border:1px solid var(--line-strong); border-radius:12px;
box-shadow:inset 2px 2px 8px rgba(174,174,174,.18), inset -2px -2px 8px rgba(255,255,255,.7);
flex:1; min-width:220px;
::placeholder{color:var(--ink-30)}
:focus{outline:2px solid var(--action); outline-offset:1px; border-color:transparent}
[aria-invalid="true"]{border-color:var(--loss); outline-color:var(--loss)}
```

**Search field** (`.blog-search input`): same recipe, `padding:9px 14px 9px 36px`, with a 15×15 stroked SVG magnifier absolutely positioned at `left:12px; top:50%; translateY(-50%)`, `stroke:var(--ink-45)`, `pointer-events:none`.

**Form layout:** `display:flex; gap:10–12px; flex-wrap:wrap; max-width:520–560px`. Input and button sit side by side and wrap together on narrow screens.

**Labels:** always `.visually-hidden` when the placeholder carries the meaning, plus a visible mono `.waitlist-label` above the group. Every form has a `.hint` in `--fs-xs` `--ink-66` below it.

**Honeypot:** `.hp{position:absolute;left:-9999px;opacity:0;height:0;width:0}` — reuse this exact class for spam protection.

**Success state** (`.waitlist .ok`): hidden by default; adding `.done` to the wrapper hides the form + hint and reveals a line of `--ink` 600 text with a leading 8px green dot. **No toasts, no modals, no alerts anywhere on this site.**

**Submission pattern (from the JS):** `preventDefault` → `checkValidity()` → focus + `aria-invalid` on failure → disable button and swap its label to "Joining…" → `fetch` POST with `Accept: application/json` → on success add `.done`; on failure fall back to a prefilled `mailto:`. Reuse this pattern verbatim.

### 6.6 Tables

Two variations, both built on the same "ledger" idea: mono uppercase keys, dashed row rules, no vertical lines, no zebra striping.

**`.ledger-table`** (blog-index — a bordered card wrapping a table):
```css
background:var(--card); border:1px solid var(--line); border-radius:14px;
box-shadow:var(--neu-soft); padding:6px 22px; margin:22px 0; overflow-x:auto;
th{mono 10.9px/.1em uppercase --ink-45; text-align:left; padding:13px 14px 10px 0; border-bottom:1px dashed var(--line-strong)}
td{padding:12px 14px 12px 0; border-bottom:1px dashed var(--line-strong); color:var(--ink-66); vertical-align:top; line-height:1.5}
td:first-child{color:var(--ink); font-weight:600; font-size:var(--fs-xs); white-space:nowrap}
tr:last-child td{border-bottom:none}
```

**`.cmp`** (article — a three-column comparison with a periwinkle header row):
```css
.cmp-wrap{overflow-x:auto; max-width:var(--measure)}
.cmp{width:100%; min-width:560px; border-collapse:collapse; background:var(--card);
     border:1px solid var(--line); border-radius:14px; box-shadow:var(--neu-soft)}
.cmp th,.cmp td{padding:14px 18px; text-align:left; vertical-align:top}
.cmp thead th{mono 10.9px/.1em uppercase --ink; background:var(--cat)}  /* corners rounded 14px */
.cmp tbody th{--fs-xs 600 --ink; width:34%; white-space:nowrap}
.cmp tbody td{--fs-sm --ink-66}
.cmp tbody tr{border-top:1px dashed var(--line-strong)}
.cmp tr.highlight-col td{color:#1FA234; font-weight:600}
```

Both wrap in `overflow-x:auto` and release `white-space:nowrap` on the first column at ≤640px.

### 6.7 Accordion / FAQ

```css
.faq{max-width:760px}
.faq details{border-bottom:1px solid var(--line)}
.faq summary{cursor:pointer; list-style:none; display:flex; justify-content:space-between;
  gap:20px; align-items:center; padding:17px 2px; color:var(--ink); font-weight:600; font-size:var(--fs-base)}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+"; font-family:var(--font-mono); color:var(--action); font-size:var(--fs-xl)}
.faq details[open] summary::after{content:"–"}
.faq details p{padding:0 2px 18px; color:var(--ink-66); font-size:var(--fs-sm); max-width:640px}
```

Native `<details>`/`<summary>` — no JS, no animation, no chevron icon. The marker is a **monospace `+` / `–`**, which is the site's only "widget" glyph. Always mirror the visible FAQ with `FAQPage` JSON-LD.

### 6.8 Blog archive rows (`.post-row`)

The most distinctive component on the blog. At rest it is a quiet dashed list; on hover a single row *becomes* a card.

```css
.post-list{list-style:none; border-top:1px dashed var(--line-strong)}
.post-row{display:grid; grid-template-columns:1fr auto; gap:8px 26px; align-items:start;
  padding:16px 18px; margin:0 -18px;            /* negative margin lets the hover card bleed past the list edge */
  border-bottom:1px dashed var(--line-strong); border-radius:14px;
  transition:transform .18s ease, background .18s ease, box-shadow .18s ease, border-color .18s ease}
.post-row:hover{background:var(--card); box-shadow:var(--neu-soft);
  transform:scale(1.012); border-color:transparent; position:relative; z-index:1}
.post-list li:has(+ li:hover){border-color:transparent}   /* hides the divider touching the hovered card */
.post-row h2{font-size:var(--fs-base); font-weight:600; letter-spacing:-.005em; line-height:1.35; margin-bottom:5px}
.post-row h2 a{color:var(--ink)}  .post-row:hover h2 a{color:var(--action)}
.post-row p{font-size:var(--fs-sm); color:var(--ink-66); line-height:1.5; max-width:640px}
.post-side{display:flex; flex-direction:column; align-items:flex-end; gap:7px; padding-top:2px}
@media(max-width:640px){ .post-row{grid-template-columns:1fr; padding:14px; margin:0 -14px}
  .post-side{flex-direction:row; align-items:center; order:-1; justify-content:space-between; width:100%} }
@media(prefers-reduced-motion:reduce){ .post-row:hover{transform:none} }
```

`.post-row.hide{display:none}` is the filter/search mechanism — client-side, no pagination, no infinite scroll.

### 6.9 Reviews carousel (`.rev-card`)

The most behaviourally complex component.

- `flex:0 0 calc((100% - 36px)/3)` → exactly 3 per viewport; `flex-basis:280px` ≤860px.
- `.rev-card.long` is clickable; `.open` expands to `calc((100% - 36px)/3*2 + 18px)` (two slots) with `transition:flex-basis .3s ease`, and the body switches to `columns:2; column-gap:26px` (single column ≤520px).
- Toggle swaps `.rev-short` / `.rev-full` and the `.rev-more::after` label between `"Read in full →"` and `"Show less ←"`.
- `.revs-viewport` height is set by JS to hug the tallest card currently in view (`transition:height .35s ease`), recalculated on scroll (rAF-throttled), resize, `document.fonts.ready` and `load`.
- Keyboard: `Enter` / `Space` toggle, `aria-expanded` maintained.
- `.rev-meta` — `margin-top:auto` pins author+date to the card bottom above a dashed rule.
- `.rev-reply` — a developer response block: `border-left:3px solid var(--cat)`, `background:rgba(187,203,247,.14)`, `border-radius:0 8px 8px 0`.

**`.rev-summary`** — the aggregate rating line: mono 20px score + star string where `.s-full{color:var(--accent)}` and `.s-part` uses a `linear-gradient(90deg,var(--accent) 60%,rgba(0,0,0,.16) 60%)` with `background-clip:text` for a partial star.

### 6.10 Timeline (`.day` / `.moment`)

The homepage's primary narrative device, reused inside articles for step-by-step instructions.

```css
.day{position:relative}
.day::before{content:""; position:absolute; left:11px; top:8px; bottom:8px; width:1px;
  background-image:linear-gradient(180deg,rgba(0,0,0,.45) 55%,transparent 45%); background-size:1px 12px}
.moment{position:relative; padding:0 0 56px 56px}
.moment:last-child{padding-bottom:0}
.moment::before{content:""; position:absolute; left:5px; top:8px; width:13px; height:13px;
  border-radius:50%; background:var(--bg); border:2px solid var(--action)}
@media(max-width:600px){.moment{padding-left:40px}}
```

Structure inside each moment: `.when` (mono blue uppercase timestamp) → `h3` (the user's problem, in their words) → `.scene` (why it fails today) → `.answer` (what the app does; `<strong>` on the key phrase) → `.chip-row` (3–4 feature chips).

`#day .eyebrow{color:var(--action)}` — the timeline section is the one place the eyebrow is blue rather than orange, matching its dots.

### 6.11 The receipt (`.receipt`)

The brand's signature object. Reuse only as a hero prop, never as a generic card.

```css
background:#FDFBF4; color:#26241E; font-family:var(--font-mono);
font-size:var(--fs-xs); line-height:1.5; border-radius:6px;
padding:28px 26px 20px; max-width:380px; margin:0 auto;
box-shadow:var(--neu), 0 14px 34px rgba(0,0,0,.10);
transform:rotate(-1.4deg); position:relative;
```
Torn bottom edge:
```css
.receipt::after{content:""; position:absolute; left:0; right:0; bottom:-9px; height:10px;
  background:radial-gradient(circle at 9px -2px, transparent 7px, #FDFBF4 7.5px);
  background-size:18px 10px; background-repeat:repeat-x}
```
Rows are a `<table>`: `td:last-child{text-align:right; white-space:nowrap; font-variant-numeric:tabular-nums}`. `.r-dash td{border-top:1px dashed #B9B4A3}`, `.r-total td{border-top:2px solid #26241E; font-weight:600; font-size:var(--fs-base)}` with the total in `#1B9A34` and outgoings in `#A4433B`. A `.receipt-caption` sits 22px below in `--fs-xs` `--ink-45`, centred, 380px wide.

### 6.12 Footer

```css
footer{border-top:1px solid var(--line); padding:26px 0 24px;
  font-size:var(--fs-xs); color:var(--ink-66); background:var(--card)}
.foot-grid{display:grid; grid-template-columns:1.6fr 1fr 1fr 1fr; gap:24px; align-items:start}
```
- Column 1: brand lockup + a 300px one-line positioning statement.
- Columns 2–4: `Explore` / `Follow` / `Help & legal`, each a mono uppercase `h4` over a `<nav>` of stacked links, `min-height:32px` each, 14×14 stroked SVG icons at `gap:6px`, hover → `--action`.
- `.foot-bottom`: dashed top border, `justify-content:space-between`, 12px mono-adjacent text; links are underlined with `text-decoration-color:var(--line-strong)` → `--action` on hover.
- Breakpoints: `1fr 1fr` ≤860px, `1fr` ≤520px.

**Canonical footer content — identical on every page.** The exact link set, in this order:

| Block | Content |
|---|---|
| Brand lockup | SVG logo + "FlipperHelper", `style="font-size:1rem"` |
| Positioning line | *"The inventory & profit tracker for resellers who source in person. Built at the car boot in London."* (max 300px) |
| **Explore** | Blog `/blog/` · Free tools `/tools/` · About `/about.html` |
| **Follow** | Instagram (stroked SVG) · Reddit (stroked SVG) |
| **Help & legal** | Support `mailto:support@flipperhelper.app` · Privacy `/privacy.html` · Terms `/terms.html` |
| `.foot-bottom` left | *"Community at [r/flipperhelper](https://reddit.com/r/flipperhelper)"* |
| `.foot-bottom` right | *"© 2025–2026 Oleksandr Prudnikov. Built for Valentina — and every reseller up before dawn."* |

**The one permitted per-page variable** is the brand link target: `href="#top"` on the homepage (scrolls up — the homepage hero carries `id="top"`), `href="/"` on every other page (goes home). Nothing else in the footer changes between pages, ever.

**Do not put in the footer:**
- A CTA or download button (§15.2).
- A "Featured on" / press / directory list. Third-party badges belong in the `.badges` section above the footer (§6.13), where they get proper artwork and hover states — not as a run of text links in `.foot-bottom`. *(A stray one was removed from the blog index in v1.2.)*
- Page-specific links. If a page needs its own links, they go in the page body.
- A newsletter form — that lives in `.newsletter`, inside `.final`, above the footer.

### 6.13 Logos / social proof (`.badges`)

```css
.badges{padding:46px 0; text-align:center}
.badges-row{display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:16px}
.badge-card{display:inline-flex; align-items:center; justify-content:center; gap:12px;
  min-height:56px; padding:8px 12px; background:var(--card);
  border:1px solid var(--line); border-radius:14px; color:var(--ink-66);
  font-size:var(--fs-sm); font-weight:600;
  box-shadow:4px 4px 14px rgba(174,174,174,.35), -4px -4px 14px rgba(255,255,255,.6)}
.badge-card:hover{transform:translateY(-2px); border-color:var(--line-strong); color:var(--ink)}
.badge-card img{height:44px; width:auto; max-width:100%; object-fit:contain; flex:none}
```
**Height-driven sizing** (44px) so every third-party badge scales identically regardless of its native aspect ratio; `object-fit:contain` prevents distortion when a narrow cell clamps `max-width`. Directory badges with no artwork get a 24×24 `.badge-ico` at `opacity:.7` → `1` on hover, plus a text label.

### 6.14 Utility classes

| Class | Definition |
|---|---|
| `.visually-hidden` | `position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0` |
| `.reveal` / `.reveal.in` | `opacity:0; transform:translateY(14px)` → `opacity:1; transform:none`, `transition:opacity .5s ease, transform .5s ease` |
| `.mono` | `font-family:var(--font-mono)` |
| `.tear` | Dashed hairline separator (see §7.4) |
| `.hp` | Honeypot |
| `.merged-gap` | `margin-top:40px` — the standard gap between two `.group-label` groups in one section |
| `.skip` | Skip-to-content link (see §6.15) |

### 6.15 Skip link (`.skip`)

**Added in v1.1.** Off-screen until focused, then it appears as a ghost-button pill at the top-left. Built from existing tokens only.

```css
.skip{
  position:absolute;left:-9999px;top:0;z-index:200;
  font-family:var(--font-body);font-weight:600;font-size:var(--fs-xs);
  background:var(--card);color:var(--ink);border:1px solid var(--line-strong);
  border-radius:12px;padding:10px 16px;box-shadow:var(--neu-soft);
}
.skip:focus{left:24px;top:8px;text-decoration:none}
```

Markup — first child of `<body>`, targeting the page's `<main>`:
```html
<body>
<a class="skip" href="#main">Skip to content</a>
...
<main id="main"> … </main>
```

`z-index:200` puts it above the sticky nav (`z-index:100`). **Required on every page.**

### 6.16 The `RESERVED` convention

**Added in v1.1.** Some CSS ships before the markup that uses it — `.bench-grid` (waiting for a second roadmap card), `.status-building` + `@keyframes pulse` (the third roadmap state), `.rev-reply` (developer replies to store reviews). These are deliberately kept, not dead code, and are marked in place:

```css
/* RESERVED — no bench grid is rendered yet (one .bench-card ships standalone).
   Kept so the next roadmap card drops in without re-deriving the grid. */
```

**Rule:** if you keep an unused rule, mark it `RESERVED` and say what will use it. Unmarked unused CSS is dead and should be removed.

---

## 7. Border Radius, Shadows & Effects

### 7.1 Radius scale

| Token / value | Where |
|---|---|
| `--radius-sm` `8px` | `.brand-mark`, `.rev-reply` right corners |
| `--radius-md` `14px` | **The card radius.** Every card, table wrapper, badge card, post-row, `.shot .ph` |
| `--radius-lg` `20px` | `.ledger` only |
| `12px` | Buttons, inputs, `.today-ic` |
| `9px` | `.nav .btn` |
| `6px` | `.receipt`, `.post-tag`/`.art-tag`/`.rev-store`, `.ledger h3` pill, `.shot figcaption`, focus-visible |
| `4px 0 0 4px` | Emphasis-card accent stripe |
| `50%` | Dots, carousel arrows |
| `999px` | Chips, status pills, filter pills, step numbers |

**Rule:** rectangles get 14px; controls get 12px; small metadata gets 6px; anything pill-shaped gets 999px. There is no 4px, 10px, 16px or 24px radius on this site.

### 7.2 Shadow system

```css
--neu:      5px 5px 30px rgba(174,174,174,.40), -10px -10px 30px rgba(255,255,255,.71);
--neu-soft: 4px 4px 22px rgba(174,174,174,.30),  -8px  -8px 22px rgba(255,255,255,.71);
```

| Shadow | Use |
|---|---|
| `--neu` | Primary buttons, emphasis cards (`.pro-card`, `.post-cta`, `.featured`), the receipt |
| `--neu-soft` | **Default for all standard cards**, ghost buttons, carousel arrows, filter pills, `.brand-mark` |
| `4px 4px 14px rgba(174,174,174,.35), -4px -4px 14px rgba(255,255,255,.6)` | **Adjacency shadow** — required whenever shadowed elements sit ≤18px apart (`.store-row .btn`, `.badge-card`) |
| `2px 2px 14px rgba(174,174,174,.4)` | `.btn:active` |
| `2px 2px 8px rgba(174,174,174,.35)` | `.store-row .btn:active`, `.badge-card:active` |
| `inset 2px 2px 8px rgba(174,174,174,.18), inset -2px -2px 8px rgba(255,255,255,.7)` | All text inputs |
| `var(--neu), 0 14px 34px rgba(0,0,0,.10)` | Receipt only — the one place a true drop shadow is added, to lift paper off the page |

**The neumorphic contract:** the warm-grey shadow always goes **bottom-right**, the white highlight always **top-left**. Never invert, never use a single-sided shadow, never use a black `rgba(0,0,0,…)` shadow on a card.

### 7.3 Borders

- Card border: `1px solid var(--line)` — always present, even under a shadow. The hairline is what stops the neumorphism looking blurry.
- Control border: `1px solid var(--line-strong)`.
- Chip border: `1.5px solid var(--cat)`.
- Accent stripe: `4px` `--accent` (`::before`, full height, left edge).
- Pull-quote: `border-left:3px solid var(--accent)`.
- Quote/reply: `border-left:3px solid var(--cat)`.
- Receipt total: `border-top:2px solid #26241E`.

### 7.4 Dividers — all dashed, all gradient-built

| Divider | Implementation |
|---|---|
| `.tear` (section separator) | `height:1px; background-image:linear-gradient(90deg,var(--line-strong) 55%,transparent 45%); background-size:14px 1px` |
| `.group-label::after` | Same gradient, `flex:1` — the label's trailing rule |
| Timeline spine | `linear-gradient(180deg,rgba(0,0,0,.45) 55%,transparent 45%); background-size:1px 12px` |
| Table rows, `.ledger-row`, `.pro-row`, `.related li`, `.rev-meta`, `.newsletter`, `.waitlist`, `.foot-bottom` | `1px dashed var(--line-strong)` (footer bottom uses `var(--line)`) |
| Section band edges, `.faq details`, card borders | `1px solid var(--line)` — the only solid rules |

### 7.5 Gradients

Only four exist, and none of them is decorative colour:

1. The dashed-line gradients above.
2. `.hero::before` — `radial-gradient(circle, rgba(229,128,37,.08), transparent 62%)`, 560×560, `top:-220px; right:-160px`, `pointer-events:none`, inside `overflow:hidden`. The only ambient glow on the site.
3. `.shot .ph` — `repeating-linear-gradient(45deg,#EDF1F5 0 12px,#F4F7FA 12px 24px)` placeholder hatching.
4. `.rev-summary .s-part` — partial-star fill via `background-clip:text`.

**Never add:** gradient buttons, gradient text (except the star trick), gradient card backgrounds, mesh gradients, colour-shifting hero backgrounds.

### 7.6 Blur / glass

`backdrop-filter:blur(14px)` on `.nav` only, paired with `rgba(248,250,251,.86)`. No other glassmorphism anywhere. Do not apply blur to cards, modals or overlays.

---

## 8. Icons & Graphic Language

### 8.1 Icon specification

All icons are **inline SVG**, no icon font, no sprite sheet, no external library.

**Stroked icons** (feature icons, footer icons, search):
```css
stroke:currentColor; fill:none; stroke-width:1.8;
stroke-linecap:round; stroke-linejoin:round;
```
| Context | Size |
|---|---|
| `.today-ic svg` | 23 × 23 |
| `.foot-col svg` | 14 × 14 |
| `.blog-search svg` | 15 × 15 (`stroke:var(--ink-45)`) |
| `.badge-ico` | 24 × 24, `opacity:.7` → `1` |

**Filled icons** — reserved for brand marks only: the FlipperHelper logo (`fill:currentColor`, 19×20, `viewBox="0 0 400 420"`), store logos inside buttons, and `.rev-store svg` (11×11, `fill:currentColor`).

**Mixed** — social icons use stroke for the outline and `fill:currentColor; stroke:none` for solid dots inside (see the Instagram/Reddit paths in the footer).

### 8.2 Icon rules

- Icons are always `currentColor`. Never hard-code an icon colour; colour the parent.
- Icon-to-text gap: `10px` in buttons, `8px` in `.trust-trio`, `7px` in status pills, `6px` in footer links, `5px` in `.rev-store`, `12px` in badge cards.
- Icons always carry `aria-hidden="true"` when the adjacent text already names them.
- Icons never appear inside body prose or headings.
- Every icon sits in a fixed-size container with `display:grid; place-items:center` or `inline-flex; align-items:center` — never inline with baseline drift.

### 8.3 Non-icon graphic motifs

| Motif | Meaning |
|---|---|
| **Small circle** — 6px (status/bullet), 7px (trust dot), 8px (success), 13px ring (timeline) | Status, presence, "this counts" |
| **Dashed line** | Paper, ledger, receipt, "a record" |
| **4px orange left stripe** | "This is the one that matters" |
| **3px orange left border** | Pull-quote / founder voice |
| **Perforated tear edge** | The receipt only |
| **Diagonal hatching** | Placeholder, temporary content |

No illustrations, no mascots, no 3D renders, no abstract blobs, no stock vector art. Do not introduce any.

---

## 9. Images & Photography

### 9.1 Current state

The site currently ships **zero photographs**. All imagery is one of:

1. **App screenshots** — aspect ratio locked to `1179/2556` (iPhone portrait), presented inside a `.shot` card at 240px wide (200px ≤520px), `border-radius:14px`, on a `1px dashed var(--line-strong)` frame while placeholders. Currently rendered as diagonal-hatch placeholders labelled `APP SCREENSHOT / 1179 × 2556 / — Screen name —`.
2. **Third-party badges** (`.badge-card img`) — height-locked to 44px, `width:auto`, `object-fit:contain`.
3. **Inline SVG** — logo and icons.

### 9.2 Rules

```css
img{max-width:100%; display:block}   /* global */
```

- **Screenshots:** always portrait `1179:2556`, always inside a `.shot` card with 12px padding, always captioned. Caption is `.shot figcaption` — mono 12px uppercase `--ink` on a `--cat` background, `border-radius:6px`, `padding:6px 4px`, `margin-top:10px`.
- **Aspect ratio is declared in CSS** (`aspect-ratio:1179/2556`), not baked into the file, so the layout never shifts on load.
- **Never** apply a shadow directly to an image — the card carries the shadow.
- **Never** crop a screenshot, add a device frame, tilt it, or overlap it with text.
- **Photography, if introduced:** it should look like the business it describes — a real car boot at 06:00, real items on a real table, natural light, no models, no stock-photo gloss. Treat any glossy stock image as off-brand. **[inferred from tone, not from existing assets]**
- Every meaningful image needs real `alt` text; decorative badges use `alt=""` when a text label sits beside them (this pattern is already used in `.badges-row`).

### 9.3 When to avoid images entirely

The site's default is **no image**. Text, a card, a table or the receipt prop carries the idea. Add an image only when it shows something words cannot: an app screen, a real find, a screenshot of a number. Never add an image for visual rhythm.

---

## 10. Motion & Interaction

### 10.1 The complete motion inventory

| Interaction | Property | Duration | Easing |
|---|---|---|---|
| Scroll reveal (`.reveal` → `.in`) | `opacity 0→1`, `translateY(14px)→0` | `.5s` | `ease` |
| Button hover | `background` (+ `border-color`, `box-shadow`) | `.15s` | `ease` |
| Button press | `translateY(1px)` + shadow collapse | `.15s` | `ease` |
| Nav link hover | `opacity` | `.12s` | `ease` |
| Carousel arrow hover | `color`, `transform` | `.12s` | `ease` |
| `.shot` hover | `translateY(-4px)` | `.18s` | `ease` |
| `.badge-card` / `.featured` hover | `translateY(-2px)` | `.15–.18s` | `ease` |
| `.post-row` hover | `transform scale(1.012)`, `background`, `box-shadow`, `border-color` | `.18s` | `ease` |
| Review card expand | `flex-basis` | `.3s` | `ease` |
| Reviews viewport height | `height` | `.35s` | `ease` |
| Filter pill | `color`, `border-color`, `background`, `transform` | `.15s` | `ease` |
| `.status-building` dot | `@keyframes pulse` opacity `1 → .3 → 1` | `1.6s` | `ease-in-out`, infinite |
| Anchor scrolling | `html{scroll-behavior:smooth}` + `scrollBy({behavior:'smooth'})` | native | native |

**That is the entire motion vocabulary.** Durations cluster at `.12 / .15 / .18` for micro-interactions and `.3 / .35 / .5` for layout/entrance. Easing is always plain `ease`. There are no custom cubic-béziers, no springs, no staggers.

### 10.2 Movement distances

`1px` (press) · `2px` (badge lift) · `4px` (screenshot lift) · `14px` (entrance rise) · `1.2%` (row scale). Nothing moves further than 14px, ever.

### 10.3 Reduced motion

The **second CSS block in every file**, before any component styles:
```css
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  *,*::before,*::after{animation:none!important; transition:none!important}
}
```
Plus a JS guard that immediately adds `.in` to every `.reveal` element so nothing stays invisible, and an explicit `@media(prefers-reduced-motion:reduce){.post-row:hover{transform:none}}`.

**Any new animation must be covered by this blanket rule and must degrade to a visible, usable state.**

### 10.4 What must stay static

- The receipt (its `-1.4deg` rotation is a static pose, not an animation).
- All headings and body text — never animate type.
- The timeline — dots and spine never draw in.
- Numbers — never count up.
- The nav — never hides on scroll, never shrinks, never changes height.

### 10.5 Motion that must NOT be introduced

Parallax · scroll-jacking · scroll-linked scrubbing · staggered list entrances · card flips · 3D transforms · marquees/auto-scrolling logo strips · looping background animation · typewriter effects · confetti · skeleton shimmer · page transitions · hover rotation or scale above 1.02 · anything that moves more than 14px · any custom easing curve.

---

---

# PART 2 — DESIGN PHILOSOPHY & UX / CONTENT SYSTEM

---

## 11. Design Philosophy

### 11.1 What the user should feel

**"This was built by someone who does what I do."** Not "this is a slick startup". Every design decision should reinforce that the maker has stood in a muddy field at 05:50 with cold hands and a phone with no signal.

### 11.2 The operating principles

1. **The app's surface is the website's surface.** Colours, shadows and the mono/sans split come from the product. A visitor who downloads the app should feel continuity, not a bait-and-switch.
2. **Every colour must mean something.** Before using orange, blue, green or periwinkle, name the meaning: act / navigate / earned / metadata. If you can't name it, use ink.
3. **Structure over decoration.** Whitespace, hairlines and dashed rules organise the page. There is nothing on the site whose only job is to look nice — except the receipt, which is the brand.
4. **One emphasis per page.** Exactly one 4px-orange-stripe card. If two blocks compete, the page has no hierarchy.
5. **Density inside, air outside.** Cards are information-dense (15.2px text at 1.55 leading). Sections are 68px apart. The contrast between the two is what makes dense content feel readable.
6. **Show the number.** £18.66. 4.6. 47 posts. 16 platforms. 49 questions. Specific numbers are more persuasive than adjectives and the design gives them mono, tabular treatment so they read as *records*, not claims.
7. **Never hide information.** No content behind hover. No "read more" that hides the point. Even the FAQ accordion shows every question; only the answers collapse.
8. **Design for a cold morning.** 44px minimum touch targets, offline-first messaging, no dependency on animation to convey state.
9. **Restraint reads as premium here.** The site avoids looking generic not by adding, but by committing hard to two unusual choices — the monospace data layer and the dashed-paper metaphor — and applying them everywhere.

### 11.3 How information is prioritised

Every page follows the same funnel of attention:

```
1. Trust line (three facts, green dots)
2. Headline (the promise, one word in green)
3. Sub (the mechanism, in plain language)
4. The two store buttons
5. The proof object (receipt / screenshot / review / number)
6. Then, and only then: detail
```

### 11.4 How much to show at once

A section presents **one idea**, supported by **three to six** items maximum (three cards, six timeline moments, five reviews visible three at a time). If you need more than six, split into two `.group-label` groups separated by `.merged-gap`.

---

## 12. UX Principles

### 12.1 Information hierarchy

The **eyebrow → H2 → lede** triad opens nearly every section. It gives three levels of entry in ~40 words:
- **Eyebrow** (mono, orange, 12px): the category — *"A day in the life — sorted"*
- **H2** (28.8–38.4px): the claim — *"You know this Sunday. So does the app."*
- **Lede** (18px, 600px wide): the reason to keep reading.

A reader who reads only eyebrows understands the page. A reader who reads only H2s understands the argument. Preserve this.

### 12.2 Navigation

- Sticky, always visible, always carries the primary CTA.
- Scroll-spy marks the current section — the only navigational state feedback.
- ≤860px: text links disappear entirely, brand + CTA remain. **No hamburger.** If a future page genuinely needs mobile navigation, add it as a new component with a strong justification — do not silently introduce a drawer.
- The footer is the real site map: three labelled columns.

### 12.3 Discoverability & progressive disclosure

Three sanctioned disclosure mechanisms, in order of preference:

1. **Truncate-and-expand in place** — the review cards (`.rev-short` / `.rev-full`). The card grows sideways; nothing navigates away.
2. **Native `<details>`** — FAQ. Questions always visible, answers collapsed.
3. **A link to the full page** — *"All 49 questions, answered honestly →"*, *"See the full comparison"*. The site prefers this over building deep in-page hierarchies.

Never use tabs, carousels-as-primary-content, modals, or hover-reveal.

### 12.4 CTA placement (homepage as reference)

| Position | CTA |
|---|---|
| Nav (sticky, always) | `Get the App` (primary, small) |
| Hero | `.store-row` — App Store + Google Play |
| Reviews section header | `.store-row` again, right-aligned |
| Pro card | Waitlist email form (secondary conversion) |
| Final section | `.store-row` centred + `.trust-trio` + newsletter |
| Footer | Navigation only, no CTA |

That is **three store-button placements per long page** — roughly one every 2–3 sections. Never more.

### 12.5 Cognitive load & scannability

- Every long block is broken by a mono label, a dashed rule, or a card boundary.
- Lists are never longer than 8 items (the Android feature list is 7).
- Tables have a mono header row and dashed rules — no zebra striping, no vertical lines, no borders around cells.
- Paragraphs are 2–4 sentences. Anything longer gets split.
- `<strong>` marks one phrase per paragraph, maximum.

### 12.6 Mobile usability

- 44px minimum nav touch target (explicit `min-height:44px`).
- 32px footer link targets.
- All buttons are `13px 22px` → ~46px tall.
- Carousels are swipeable natively with snap; arrows are a desktop convenience, not the only control.
- Forms wrap input-above-button; no horizontal scroll anywhere except deliberate `overflow-x:auto` on tables and carousels.

### 12.7 Accessibility baked into UX

- `aria-labelledby` on every `<section>`, pointing at its H2's `id`.
- `aria-label` on every `<nav>` (`"Main"`, `"Footer — explore"`, …).
- `aria-current="page"` on the active nav link.
- `aria-expanded` maintained on expandable review cards; `aria-pressed` on filter pills.
- `.visually-hidden` labels for search and email inputs.
- `aria-hidden="true"` on decorative SVG.
- Global `:focus-visible` outline in `--action` with 3px offset.

### 12.8 Form usability

- One field per form. The waitlist and newsletter each ask for an email and nothing else.
- Validation on submit, not on blur.
- The button label is the status indicator ("Join the waitlist" → "Joining…").
- Success replaces the form in place.
- A `mailto:` fallback runs if the POST fails — the user is never stranded.
- Every form states what happens next: *"One email when Pro is ready, early access first. No spam — your call to leave anytime."*

### 12.9 What a new page should prioritise

1. Make the **one thing this page is for** obvious in the first viewport.
2. Give the user a **reason to trust** before asking for anything (trust-trio, a real number, a real review).
3. Keep the **store buttons** reachable without hunting.
4. End with the **final CTA + newsletter** block — it closes every page on the site.

---

## 13. Content Hierarchy

### 13.1 How headlines are written

**Homepage H1:** a promise with one word in green.
> Every find, *tracked*. Your real profit, counted.

**Section H2s:** short, declarative, often second-person, frequently containing a colloquialism.
> You know this Sunday. So does the app.
> Built at the car boot, not in a boardroom
> What it handles today — and what's next
> Your next haul deserves honest numbers.

**Article H1:** descriptive + the benefit, em-dash joined.
> FlipperHelper Is Now on Android — and Your Data Moves With You

**Article H2s:** plain, searchable, question-shaped or how-shaped.
> What you get on Android · How automatic backup works on iPhone · One backup file, both platforms

**Rules:** sentence case (article H1s use title case), no colons-as-subtitles, no clickbait numbers ("7 ways to…"), no ALL CAPS, em-dashes preferred over colons.

### 13.2 Sub-headings and ledes

The lede is one or two sentences, 18px, capped at 600px, and it explains the *mechanism*, not the benefit:

> The free app that follows each item's path — from the stall where you found it to the platform where it sold — and shows what you actually made after every fee, fare and entry ticket. No spreadsheet gymnastics.

Note the structure: **what it does → the range it covers → the concrete outputs → a short dismissive kicker.**

### 13.3 Paragraph structure

2–4 sentences. 17px, 1.6 leading, `--ink-66`, max 720–900px. One `<strong>` per paragraph, marking the sentence a skimmer must read. The pattern inside timeline moments is a fixed three-beat:

1. **The scene** — what actually happens (`--ink-66`, `.scene`)
2. **The failure** — why the current method breaks
3. **The answer** — what the app does, with the key clause in `<strong>` (`--ink`, 600)

### 13.4 Highlighting important information

In descending order of force:

1. Green `<em>` in the H1 — once per site.
2. Orange-striped emphasis card — once per page.
3. `.rule` pull-quote (orange left border, 18px, weight 700) — the founder's voice or the governing principle.
4. `<strong>` → `--ink` + 600.
5. A mono label / chip / status pill.
6. A number rendered in mono with tabular figures.

### 13.5 Lists

Never `list-style` default. The site's bullet is a **6px periwinkle circle**:
```css
li{position:relative; padding-left:22px; margin-bottom:9px; color:var(--ink-66)}
li::before{content:""; position:absolute; left:4px; top:.58em; width:6px; height:6px;
  border-radius:50%; background:var(--cat)}
```
List items typically lead with a bolded term, then an em-dash, then the detail:
> **16 listing platforms** — eBay, Vinted, Facebook Marketplace, Depop, Poshmark, Mercari, Etsy, Gumtree and more (tracked manually, not automated cross-listing)

Note the parenthetical honesty caveat. That is characteristic.

### 13.6 How statistics are presented

Always in the **ledger pattern**: a label, a description, and a mono green amount, on a dashed row.

| Label | Description | Amount |
|---|---|---|
| Month 1 | First target: £200 turnover, charity-shop test runs | £200 |
| Year 1 | Regular monthly clearings | £1,300–1,900 |
| Now | Yearly income from reselling | £18–25k |

Followed by a `.foot` note in 12px `--ink-45` establishing provenance: *"Real figures from our own business — same screens you get, no special version."*

**Statistics are always attributed, always ranged when uncertain, never rounded up for effect** (4.6, not "nearly 5 stars").

### 13.7 How pricing is presented

There is no pricing table, because the product is free. The pattern is:

- State it flatly: *"Is FlipperHelper really free?" → "Yes."*
- Enumerate exactly what free includes.
- Guarantee it: *"Everything that's free today stays free. Pro only adds on top."*
- Describe the paid tier by **what it does**, never by price (no price is published for Pro).
- Collect intent (waitlist), not money.

If a price ever appears, follow the ledger typography: mono, tabular, `--ink`, with the qualifier in 12px `--ink-45` beneath.

### 13.8 How CTAs are phrased

| CTA | Where |
|---|---|
| `Get the App` | Nav |
| `Download on the App Store` / `Get it on Google Play` | Full-width contexts |
| `App Store` / `Google Play` | Compact contexts (hero, section headers) |
| `Join the waitlist` | Pro |
| `Subscribe` | Newsletter |
| `Read the post →` | Featured post |
| `← Back to Blog` | Article |
| `Read in full →` / `Show less ←` | Review expansion |
| `All 49 questions, answered honestly →` | FAQ overflow |

**Pattern:** verb + object, no exclamation marks, no "free" in the button (freeness is established in the supporting text), arrows only on text links — never inside buttons.

---

## 14. Tone of Voice

### 14.1 Profile

| Dimension | Setting |
|---|---|
| **Tone** | Direct, warm, specific. A capable person explaining their own tool. |
| **Personality** | Craftsman-operator. Slightly dry. Occasionally self-deprecating. |
| **Formality** | Informal but literate. Contractions yes; slang sparingly and only reseller-native ("boot", "flip", "haul", "find"). |
| **Person** | Second person for the user's experience ("You know this Sunday"). First-person plural for the company ("We read every message"). First-person singular for the founder ("So I built her an app"). |
| **Sentence length** | Short-to-medium. Fragments used deliberately for rhythm: *"Muddy field. No signal. Three finds in ten minutes."* |
| **Vocabulary** | Concrete nouns. Real place names (Chessington, France, London). Real amounts. Real platforms. |
| **Technical terms** | Used when precise (SKU, offline-first, ZIP, multi-currency, GPS) and always immediately explained in plain terms. |
| **Marketing language** | Near zero. No "revolutionise", "seamless", "game-changing", "empower", "unlock". |
| **Confidence** | High but never boastful. Confidence comes from specificity, not adjectives. |
| **Directness** | Very high. Questions get a one-word answer first, then the explanation. |
| **Locale** | British English (`og:locale: en_GB`) — "organised", "£", "car boot", "Self Assessment", "HMRC". Dates as `4 July 2026`. |

### 14.2 DO

- **Open with the reader's reality, not the product.**
  > *"05:50 · The boot opens — Muddy field. No signal. Three finds in ten minutes."*
- **Name the failure the product fixes, honestly.**
  > *"Trip costs are where spreadsheet profit quietly turns into fiction."*
- **Answer the actual question first.**
  > *"Is FlipperHelper really free?" → "Yes."*
- **Use real, specific, verifiable numbers.**
  > *"£3.50 entry, £12 of fuel, a bacon roll. Who's paying for that?"*
- **Concede limits proactively.**
  > *"tracked manually, not automated cross-listing"* · *"Different category. Vendoo posts your listings…"*
- **Give the user agency.**
  > *"Your numbers, your call."* · *"Your call when."* · *"No spam — your call to leave anytime."*
- **Close a section with a short, flat sentence.**
  > *"The maths most of us skip. The app doesn't."*
- **Attribute opinions to a named human.**
  > *"— Oleksandr Prudnikov, developer · London"*

### 14.3 DON'T

- ❌ *"Revolutionise your reselling workflow with our AI-powered platform."* — no hype nouns, no AI claims that aren't true.
- ❌ *"Join thousands of happy sellers!"* — no unverifiable counts, no exclamation marks.
- ❌ *"Effortlessly seamless. Beautifully simple."* — no adjective stacking.
- ❌ *"Don't miss out — limited time!"* — no urgency, no scarcity, no FOMO.
- ❌ *"We're passionate about empowering the reselling community."* — no mission-statement filler.
- ❌ *"Our app is better than Vendoo."* — competitor comparisons are always framed as *different category*, never as *worse*.
- ❌ *"Up to 10x more profit."* — never a multiplier the product cannot cause.
- ❌ American spellings, `$` when the context is UK, `MM/DD/YYYY` dates.
- ❌ Emoji anywhere in site copy.
- ❌ Second-person imperatives that shame ("Stop losing money!").

### 14.4 The governing sentence

> *"If a feature doesn't survive a Sunday morning at a car boot, it doesn't ship."*

This appears twice on the homepage and is the brand's constitution. Copy for a new page should be testable against it: does this claim survive contact with a real market morning?

---

## 15. Conversion & CTA Principles

### 15.1 CTA hierarchy

| Tier | CTA | Visual treatment |
|---|---|---|
| **Primary** | App Store / Google Play download | `.btn-primary` (orange, `--neu`) + `.btn-ghost` pair in `.store-row` — note: the *pair* is the primary action; one store is orange, the other is ghost-white |
| **Secondary** | Pro waitlist email | Orange button inside the emphasis card, gated behind a mono `.waitlist-label` |
| **Tertiary** | Newsletter subscribe | Smaller, centred, at the very bottom, after the primary CTA has been served |
| **Quaternary** | Text links with `→` | `--action`, mono for micro-links, inline for prose |

### 15.2 Placement rules

- The primary CTA is **always in the sticky nav**, so it is never more than a glance away.
- Full `.store-row` appears **2–3 times on a long page**: hero, mid-page next to social proof, and in the final block.
- Inside articles: one `.store-row` after the opening lede, and one `.post-cta` emphasis card before the author bio.
- **Never** two CTA blocks in adjacent sections.
- **Never** a CTA in the footer.

### 15.3 Trust elements — always adjacent to a CTA

1. `.trust-trio` — three green-dotted facts, in the hero and repeated in the final block, *verbatim*.
2. Platform requirements stated plainly: *"Free on iOS 17+ and Android 8+."*
3. Unedited reviews with real usernames, real dates and the real store badge.
4. An honest aggregate: *"4.6 ★★★★☆ · App Store · 10 ratings"* — including the small sample size.
5. Third-party directory badges (`Featured on`).
6. Named founder, named city, named lead tester.

### 15.4 Friction reduction

- No sign-up required to use the app; the site says so (*"no account needed"*).
- The download CTA links straight to the stores — no interstitial, no email gate.
- The waitlist asks for one field.
- Every form declares its consequence before you submit.
- *"Set it up in the car park if you like — works offline from the first minute."* — pre-empting the "will this work where I am" objection at the moment of decision.

### 15.5 How a new page should handle its actions

1. Decide **one** primary action. It is almost always "download the app".
2. Put a `.store-row` in the first viewport and one in the final block.
3. Put **one** secondary action in an emphasis card in the middle third.
4. Attach a trust element to every CTA cluster.
5. End every page with the standard `.final` + `.newsletter` block. This is the site's universal closer and should be treated as a required footer-adjacent component.

---

## 16. Responsive Design Philosophy

### 16.1 The intention

The desktop and mobile layouts are **the same page at different densities**, not two designs. Nothing is hidden from mobile users except decorative nav links, and nothing is added for them except stacking.

### 16.2 Breakpoints in use

| Width | What changes |
|---|---|
| `≤920px` | `.hero-grid` and `.story-grid` → single column (gaps 48/44px) |
| `≤860px` | `.today-grid`, `.bench-grid` → 1 column · `.foot-grid` → 2 columns · **nav text links hidden** · `.rev-card` → fixed 280px basis |
| `≤720px` | `section` padding `68 → 48` · `.page-head` `64 → 44` · `.trust-trio` reverts to wrapping · `.blog-search` goes full width and moves to `order:-1` |
| `≤640px` | `.pro-row` → 1 column · `.post-row` → 1 column with meta on top · tables release `nowrap` on the first column |
| `≤600px` | `.moment` left padding `56 → 40` |
| `≤520px` | `.foot-grid` → 1 column · `.shot` `240 → 200px` · `.badges` padding `46 → 34` · `.rev-card.open .rev-text` → 1 column |

`@media(min-width:720px)` is used once, to make `.trust-trio` a single nowrap row on desktop.

### 16.3 What changes

- **Stacks:** every multi-column grid, in one step (3→1 or 2→1). **There is no intermediate 2-column tablet state for the 3-up card grids** — this is deliberate; two cards plus one orphan looks worse than a clean column.
- **Disappears:** nav text links (≤860px) — and nothing else on the entire site.
- **Reorders:** `.post-side` metadata moves above the post title (`order:-1`); `.blog-search` moves above the filters.
- **Becomes scrollable:** carousels (always), tables (`overflow-x:auto`, `.cmp` keeps `min-width:560px`).
- **Reflows:** `.rev-card.open` gets `max-width:calc(100vw - 56px)` so an expanded review can never exceed the viewport.

### 16.4 What does not change

- Card padding, button padding, border radii, shadows.
- Font sizes for body, cards, labels and badges.
- The 24px page gutter.
- The 18px grid gap.
- The nav height and the primary CTA.
- The order of sections.

### 16.5 The responsive rule for new pages

> Build the desktop grid, then choose a **single** breakpoint at which it collapses to one column. Do not build a tablet-specific layout. Do not shrink type or padding. Do not hide content. If content must be hidden on mobile, it probably should not be on the page at all.

---

## 17. Accessibility Principles

### 17.1 Already implemented

| Area | Implementation |
|---|---|
| **Focus** | Global `a:focus-visible, button:focus-visible, summary:focus-visible{outline:2px solid var(--action); outline-offset:3px; border-radius:6px}`; buttons use `offset:2px`; inputs use `offset:1px` + transparent border |
| **Touch targets** | Nav links `min-height:44px`; footer links `min-height:32px`; buttons ~46px tall |
| **Landmarks** | `<nav aria-label>`, `<header>`, `<footer>`, `<section aria-labelledby>` on every section |
| **Headings** | One `<h1>` per page, no skipped levels |
| **Keyboard** | Native `<details>`; review cards handle `Enter`/`Space` and maintain `aria-expanded`; filter pills use `aria-pressed` |
| **Labels** | `.visually-hidden` `<label>` for every input |
| **Images** | `alt` on meaningful badges, `alt=""` + adjacent text label on decorative ones, `aria-hidden="true"` on decorative SVG |
| **Motion** | Global `prefers-reduced-motion` kill switch + JS fallback that reveals hidden elements |
| **Semantics** | Real `<table>`, real `<dl>` for pro rows, real `<ul>` for feature grids, `<figure>/<figcaption>` for screenshots |
| **Skip link** | `.skip` as the first child of `<body>`, targeting `#main` *(added v1.1)* |
| **Main landmark** | `<main id="main">` wrapping the page content on every page *(added v1.1)* |
| **Numerals** | `font-variant-numeric:tabular-nums` on all quantities |

### 17.2 Known gaps — fix these on new pages, without changing the visual identity

1. **White on `--accent` is ~2.8:1.** Do not restyle the button. Mitigate: keep labels ≥16px/600, always pair the button with legible `--ink-66` supporting text, and never use orange as a text colour for unique information.
2. **`.eyebrow` in `--accent` is ~2.8:1.** Treat eyebrows as decorative. Every eyebrow must duplicate information already present in the H2 below it.
3. **`--action` links are ~4.3:1** — just under AA. Keep the hover underline, and never remove `text-decoration` from an inline prose link.
4. **`--ink-45` metadata is ~3.3:1.** Acceptable for dates and read-time; never use it for instructions, form hints that matter, or error text.
5. ~~No skip-to-content link exists.~~ **Fixed in v1.1** — `.skip` now ships on all three pages (§6.15).
6. ~~`<main>` landmark missing on the homepage and blog index.~~ **Fixed in v1.1** — all three pages now wrap their content in `<main id="main">`.
7. **No mobile navigation below 860px.** Content pages with more than a handful of sections should provide in-page navigation another way (an in-article table of contents built from the `.related` list pattern) rather than relying on the hidden nav. *(Still open — deliberate; see §12.2.)*

### 17.3 Rules for new pages

- Contrast: body text must be `--ink-66` or darker. Never `--ink-45` for content.
- Every interactive element must have a visible `:focus-visible` state — inherit the global rule, never `outline:none`.
- Never convey state by colour alone: the status pills pair colour with a dot *and* a word; filter pills pair colour with `aria-pressed`.
- Every new animation must be inside the global reduced-motion kill switch.
- Every form control needs a programmatic label, even when a placeholder is present.

---

---

# PART 3 — AI IMPLEMENTATION GUIDE

---

## 18. Core Rule

> **Every new page must be indistinguishable from the existing site.**
> You are extending a finished design system, not designing. Reuse before you vary; vary before you invent; invent only when nothing in this document can express the content — and then build the new thing entirely out of existing tokens.

The detailed rules:

1. **Copy the `:root` block verbatim.** Every page carries the identical `:root` from §24. Do not add, rename, remove or re-value a single token. If you need a colour that isn't there, you are wrong about the colour.
2. **Copy the global reset, nav and footer verbatim.** These three blocks are identical across all three source files and must stay identical.
3. **Use the type ladder as-is.** Never write a raw `font-size` in px or rem for text; always use a `--fs-*` token or an existing `clamp()`.
4. **One card radius (14px), one grid gap (18px), one frame (1080/1032px).**
5. **Two font families, two roles.** Mono = machine/data/label. Sans = human/prose. Never mono for a paragraph, never sans for a status pill.
6. **One emphasis card per page.**
7. **Every section opens with `.eyebrow` → `.section-title` → `.section-lede`** unless it is the hero, the final CTA, or an article body section.
8. **Every page closes with `.final` + `.newsletter` + `footer`.**
9. **Comment your CSS the way the existing CSS is commented** — explain *why* a value was chosen when it isn't obvious. This is a real convention in this codebase (see the shadow-adjacency comments) and it is part of the house style.
10. **When you deviate, say so in a CSS comment**, naming which existing component you varied and why — exactly as `blog-index.html` does (*"pro-card variation: orange stripe marks the flagship block"*).

---

## 19. How AI Should Create a New Page

### Phase 1 — Understand (no code yet)

1. **Name the page's single job** in one sentence. If you need two sentences, it is two pages.
2. **Name the reader** and the moment they arrive (mid-flip on a phone? researching on a laptop? arriving from Google with a specific question?).
3. **Name the primary conversion goal** — almost always "download the app". Name the secondary (waitlist / newsletter / read another article).
4. **Name the proof** you will use: a real number, a real review, a real screenshot, a real receipt. If you have no proof, get one — do not invent one (§14.3).

### Phase 2 — Structure

5. **Pick a page archetype** from §25 (Homepage / Blog Index / Article / Utility). Do not invent a fifth without a strong reason.
6. **Pick the patterns** from the pattern library that carry your content. Write the section list before writing any HTML:
   ```
   nav · hero-or-page-head · [pattern] · [pattern] · .tear · [pattern] · .final+.newsletter · .badges? · footer
   ```
7. **Assign the one emphasis card.** Which single block gets the 4px orange stripe?
8. **Place the CTAs** per §15.2 — first viewport, mid-page, final block.

### Phase 3 — Content

9. **Write eyebrow / H2 / lede for every section first.** If those three lines don't make the section's case, the section is wrong.
10. **Write body copy in the established voice** (§14). Test each claim against *"would this survive a Sunday morning at a car boot?"*
11. **Convert every vague claim into a specific number or delete it.**

### Phase 4 — Build

12. Paste the shared `:root`, reset, `.nav` and `footer` blocks unchanged.
13. Add only the component CSS the page actually uses. **Do not ship the whole site stylesheet** — each page in this project carries exactly the CSS it needs, in the same order (tokens → reset → shared → page-specific).
14. Compose from existing components. Where you vary one, add the `/* VARIATION of X: ... */` comment.
15. Apply spacing from §4 — 68px sections, 18px gaps, 22px card padding, 16px paragraph margins.

### Phase 5 — Verify

16. **Responsive:** check 1280 / 860 / 720 / 520 / 375. Confirm a single clean collapse, no horizontal scroll on `<body>`, expanded elements capped to viewport.
17. **Accessibility:** run §17.3. Confirm `aria-labelledby` on sections, one H1, focus-visible everywhere, reduced-motion covered.
18. **SEO/metadata — required on *every* page, not just articles.** `title`, escaped `meta description`, `canonical`, favicon, `apple-itunes-app`, the full OpenGraph set with `og:locale=en_GB`, a Twitter card, and page-appropriate JSON-LD. See the metadata matrix in §25.14.
19. **Consistency sweep:** open the homepage side by side. Any colour, radius, shadow, gap or font-size that isn't in §24 must go.
20. **Delete anything you added "for visual interest".**

---

## 20. Component Reuse Rules

### Reuse an existing component when…

- The content has the same **shape** (a card with an icon, a title and a sentence → `.today-card`).
- The content has the same **job** (marking the most important block → the emphasis card).
- A pattern in §25 already covers the section.

**Default answer: reuse.** The blog was built almost entirely by reuse, and its CSS says so in comments.

### Create a variation when…

- The structure matches but the **layout differs** — e.g. `.cmp` is the `.ledger` idea in three columns instead of two.
- The structure matches but the **semantics differ** — e.g. `.filters button` is a chip that is genuinely interactive, so it moves from `--cat` to `--action`.
- The component needs a **different emphasis level** — e.g. `.featured` is `.pro-card` applied to a blog post.

A variation must:
- Keep the parent's radius, shadow, padding and typography.
- Change **one** thing (layout, colour semantics, or emphasis) — never all three.
- Carry a comment: `/* VARIATION of .pro-card: ... */`.

### Create a new component only when…

- No existing component and no single-axis variation can express the content, **and**
- The content is genuinely new to the site (not a rephrasing of an existing section), **and**
- You can build it entirely from §24 tokens with zero new values.

### Do NOT create a component when…

- It would be used once and a plain `<div>` with utility spacing would do.
- It duplicates an existing component with a different name.
- Its only justification is "this page should feel different".
- It requires a colour, radius, shadow or font not in §24.

---

## 21. New Component Rules

A genuinely new component must satisfy **all** of the following before it ships:

| Requirement | Check |
|---|---|
| **Typography** | Every size is a `--fs-*` token or an existing `clamp()`. Mono only for labels/data. Weights only from {400, 500, 600, 700, 800}. |
| **Colour** | Every colour is a `:root` token, a documented literal from §2.3, or an `rgba()` tint of a brand colour at ≤0.14 alpha. |
| **Spacing** | Padding from {12, 18, 22, 26, 30}. Gaps from {6, 8, 10, 12, 18, 24}. Margins from the §4.1 scale. |
| **Radius** | 14px if it's a card, 12px if it's a control, 6px if it's metadata, 999px if it's a pill, 50% if it's a dot. Nothing else. |
| **Shadow** | `--neu-soft` by default, `--neu` only for the page's single emphasis element, the adjacency shadow if neighbours are ≤18px away, inset for inputs. |
| **Border** | `1px solid var(--line)` on cards, `1px solid var(--line-strong)` on controls, dashed for internal rules. |
| **Interaction** | Hover = lift ≤4px and/or a colour shift to `--action`. Transition `.12–.18s ease`. Active = `translateY(1px)`. Focus = inherit the global outline. |
| **Responsive** | One breakpoint, one collapse to a single column. No size changes. |
| **Motion** | Covered by the global reduced-motion rule. |
| **Naming** | Short, lowercase, hyphenated, semantic (`.post-row`, `.rev-card`, `.pro-foot`) — not presentational (`.blue-box`, `.big-card`). |

And the meta-rule:

> **A new component must look like it was always there.** If a stranger could point at it and say "that's the new bit", it has failed.

---

## 22. Do / Don't Rules

### DO

- ✅ Copy the exact `:root` block into every new page.
- ✅ Open sections with the mono orange eyebrow → tight H2 → 600px lede triad.
- ✅ Use 18px for every grid gap, 22px for standard card padding, 68px (48 mobile) for section padding.
- ✅ Use `--neu-soft` for ordinary cards and reserve `--neu` for the one emphasis block.
- ✅ Use the adjacency shadow (`4px/14px/.35`) whenever shadowed elements sit ≤18px apart.
- ✅ Put every date, amount, count, status and category label in `Roboto Mono`, uppercase, with wide tracking.
- ✅ Give every quantity `font-variant-numeric:tabular-nums`.
- ✅ Use dashed rules for internal dividers and reserve solid hairlines for card and section boundaries.
- ✅ Mark exactly one block per page with the 4px orange stripe.
- ✅ Keep `--cat` periwinkle strictly non-interactive and `--action` blue strictly interactive.
- ✅ Bold *and* darken (`<strong>` → `--ink` 600) — never one without the other.
- ✅ Close every page with `.final` + `.newsletter` + `footer`.
- ✅ Copy the nav (§6.1) and the footer (§6.12) verbatim onto every new page — same seven nav items, same footer links, same order.
- ✅ Cite real numbers, real names, real reviews, real dates.
- ✅ Write a `/* why */` comment when a value looks arbitrary.
- ✅ Wrap tables in `overflow-x:auto` and give wide ones a `min-width`.
- ✅ Add `aria-labelledby` to every `<section>` and `aria-label` to every `<nav>`.

### DON'T

- ❌ Don't introduce any colour outside §2 — no teals, no purples, no second orange, no "slightly different grey".
- ❌ Don't introduce a third typeface, and don't use a system font stack directly.
- ❌ Don't create a card style with a different radius, a single-sided shadow, or a coloured background fill.
- ❌ Don't use gradients as decoration — the only gradients on this site draw dashed lines, one 8%-opacity hero glow, and a partial star.
- ❌ Don't add a dark mode, a dark section, or an inverted band.
- ❌ Don't add parallax, scroll-scrubbing, staggered entrances, counters, marquees, skeletons, page transitions, or any custom easing curve.
- ❌ Don't change the border radius conventions (no 4/10/16/24px).
- ❌ Don't build a mobile hamburger menu without an explicit UX justification — the site deliberately has none.
- ❌ Don't put a CTA in the footer.
- ❌ Don't add, remove or reorder a nav item for a new page — a new page earns a footer link, not a nav slot.
- ❌ Don't add press/directory links to `.foot-bottom` — third-party badges belong in the `.badges` section.
- ❌ Don't stack two CTA blocks in adjacent sections.
- ❌ Don't use `--ink-45` for anything a user must read.
- ❌ Don't put unique information in an orange eyebrow (contrast).
- ❌ Don't make a periwinkle chip clickable.
- ❌ Don't use the receipt component for anything other than a signature hero prop.
- ❌ Don't add stock photography, illustrations, mascots, 3D renders or abstract shapes.
- ❌ Don't use emoji, exclamation marks in body copy, or American spellings.
- ❌ Don't invent statistics, review quotes, user counts or award badges.
- ❌ Don't hide content on mobile.
- ❌ Don't ship a page whose CSS contains a hex value that isn't in §24 or §2.3.

---

## 23. Page Consistency Checklist

Run this before declaring any page done.

### Brand
- [ ] Would a visitor arriving from the homepage know this is the same site without reading the nav?
- [ ] Is the mono/sans split respected — mono for all data and labels, sans for all prose?
- [ ] Is there exactly one emphasis (orange-stripe) block?
- [ ] Does the copy pass the "Sunday at a car boot" test?

### Visual
- [ ] Does the page's CSS contain **only** tokens from §24 plus documented literals from §2.3?
- [ ] Every card: 14px radius, `1px solid var(--line)`, `--neu-soft` (or `--neu` for the one emphasis block)?
- [ ] Every grid gap 18px (or a documented exception: 64px hero/story, 24px footer, 26px post-row)?
- [ ] Section padding 68px desktop / 48px mobile?
- [ ] Card padding 22px (or 26px 22px for emphasis, 18px for carousel cards)?
- [ ] All dividers dashed except card and section hairlines?
- [ ] No new shadow, no new radius, no new font-size?

### UX
- [ ] Eyebrow → H2 → lede on every section (except hero / final / article body)?
- [ ] Is the primary action visible in the first viewport and repeated in the final block?
- [ ] Is a trust element adjacent to every CTA cluster?
- [ ] Can the page be understood by reading only the H2s?
- [ ] Are there ≤6 items per section group?
- [ ] Is anything hidden behind hover? (There must not be.)

### Content
- [ ] Sentence-case headings, no colons-as-subtitles, no clickbait?
- [ ] British English, `£`, `4 July 2026` date format?
- [ ] One `<strong>` per paragraph, marking the skim line?
- [ ] Every number specific, attributed and un-rounded?
- [ ] Every limitation stated rather than hidden?
- [ ] No hype adjectives, no exclamation marks, no emoji?

### Responsive
- [ ] 1280px — the intended layout?
- [ ] 860px — nav links gone, grids collapsed, footer 2-up?
- [ ] 720px — section padding 48, search full width?
- [ ] 520px — footer single column, everything readable?
- [ ] 375px — no horizontal scroll on `<body>`; tables and carousels scroll inside their own containers?

### Accessibility
- [ ] `.skip` link present as the first child of `<body>`, targeting `<main id="main">`?
- [ ] Nav identical to §6.1 — seven items, same labels, same order, anchors prefixed with `/`?
- [ ] Footer identical to §6.12 — only the brand `href` differs?
- [ ] One `<h1>`, no skipped heading levels?
- [ ] `aria-labelledby` on sections, `aria-label` on navs, `aria-current` on the active link?
- [ ] Visible `:focus-visible` on every interactive element, nothing set to `outline:none`?
- [ ] Body text `--ink-66` or darker?
- [ ] Every input has a real (possibly visually hidden) label?
- [ ] Decorative SVG `aria-hidden="true"`; meaningful images have `alt`?
- [ ] All motion inside the reduced-motion kill switch?
- [ ] Touch targets ≥44px in the nav, ≥32px in the footer?

### Metadata
- [ ] `title`, `meta description` (ampersands escaped as `&amp;`), `canonical`, favicon?
- [ ] Full OpenGraph set with `og:locale=en_GB` + Twitter card?
- [ ] Page-appropriate JSON-LD, and does every `FAQPage` entry match visible on-page text verbatim?
- [ ] All cross-page links root-absolute (`/faq.html`), and does every in-page anchor resolve to a real `id`?

### Design System
- [ ] Did you reuse before varying, and vary before inventing?
- [ ] Is every variation commented with its parent component?
- [ ] Did you avoid adding any component used only once?
- [ ] Does the page ship only the CSS it uses?

---

## 24. Design Tokens

### 24.1 The canonical `:root` — copy verbatim

```css
:root{
  /* App palette */
  --bg:#F8FAFB;                 /* page background — same as the app */
  --card:#FFFFFF;
  --ink:#000000;                /* primary text */
  --ink-66:rgba(0,0,0,.66);     /* secondary text / inactive nav */
  --ink-45:rgba(0,0,0,.45);
  --ink-30:rgba(0,0,0,.30);
  --profit:#32D347;             /* income / data highlight, "Sold" green */
  --action:#1E76F1;             /* clickable text, selected state */
  --accent:#E58025;             /* "Add New Item" orange — primary buttons */
  --accent-hover:#F08F38;
  --cat:#BBCBF7;                /* small category header bg / chip outline */
  --loss:#E14B4B;
  --line:rgba(0,0,0,.08);
  --line-strong:rgba(0,0,0,.14);

  /* NEUMORPHISM1 — exactly as in the app */
  --neu:5px 5px 30px rgba(174,174,174,.40), -10px -10px 30px rgba(255,255,255,.71);
  --neu-soft:4px 4px 22px rgba(174,174,174,.30), -8px -8px 22px rgba(255,255,255,.71);

  --font-body:'Roboto Flex', -apple-system, 'Helvetica Neue', Arial, sans-serif;
  --font-mono:'Roboto Mono','SF Mono',ui-monospace,Menlo,monospace;

  --radius-sm:8px; --radius-md:14px; --radius-lg:20px;
  --max:1080px;

  /* type scale — one ladder for the whole site */
  --fs-3xs:.68rem;   /* micro mono: pills, column headers */
  --fs-2xs:.75rem;   /* eyebrow, labels, footnotes */
  --fs-xs:.85rem;    /* nav, footer links, hints */
  --fs-sm:.95rem;    /* card body text */
  --fs-base:1rem;    /* buttons, brand, ui */
  --fs-md:1.0625rem; /* body copy */
  --fs-lede:1.125rem;/* section ledes + hero sub */
  --fs-h3:1.05rem;   /* card titles */
  --fs-h3-lg:1.25rem;/* feature-card title */
  --fs-xl:1.2rem;    /* large ui accents */
}
```

Article pages additionally declare:
```css
--measure:900px;   /* article text measure (see §5.2 — 720px is the alternative) */
```

### 24.2 Colour reference

| Token | HEX / value | RGB |
|---|---|---|
| `--bg` | `#F8FAFB` | 248, 250, 251 |
| `--card` | `#FFFFFF` | 255, 255, 255 |
| `--ink` | `#000000` | 0, 0, 0 |
| `--ink-66` | `rgba(0,0,0,.66)` | ≈ #565758 on `--bg` |
| `--ink-45` | `rgba(0,0,0,.45)` | ≈ #898A8B on `--bg` |
| `--ink-30` | `rgba(0,0,0,.30)` | ≈ #ADAFB0 on `--bg` |
| `--profit` | `#32D347` | 50, 211, 71 |
| `--action` | `#1E76F1` | 30, 118, 241 |
| `--accent` | `#E58025` | 229, 128, 37 |
| `--accent-hover` | `#F08F38` | 240, 143, 56 |
| `--cat` | `#BBCBF7` | 187, 203, 247 |
| `--loss` | `#E14B4B` | 225, 75, 75 |
| `--line` | `rgba(0,0,0,.08)` | — |
| `--line-strong` | `rgba(0,0,0,.14)` | — |
| *lit.* green-text | `#1FA234` | 31, 162, 52 |
| *lit.* receipt paper | `#FDFBF4` | 253, 251, 244 |
| *lit.* receipt ink | `#26241E` | 38, 36, 30 |
| *lit.* receipt muted | `#8B8676` | 139, 134, 118 |
| *lit.* receipt rule | `#B9B4A3` | 185, 180, 163 |
| *lit.* receipt total | `#1B9A34` | 27, 154, 52 |
| *lit.* receipt negative | `#A4433B` | 164, 67, 59 |
| *lit.* placeholder A | `#EDF1F5` | 237, 241, 245 |
| *lit.* placeholder B | `#F4F7FA` | 244, 247, 250 |

### 24.3 Typography reference

| Token | rem | px | Line-height | Tracking |
|---|---|---|---|---|
| `--fs-3xs` | .68 | 10.9 | — | `.08–.14em` (mono) |
| `--fs-2xs` | .75 | 12 | — | `.08–.14em` (mono) |
| `--fs-xs` | .85 | 13.6 | 1.5 | — |
| `--fs-sm` | .95 | 15.2 | 1.5–1.55 | — |
| `--fs-base` | 1 | 16 | 1.6 | `.01em` (buttons) |
| `--fs-md` | 1.0625 | 17 | 1.6 | — |
| `--fs-lede` | 1.125 | 18 | 1.4 (quote) / 1.6 | `-.01em` (quote) |
| `--fs-h3` | 1.05 | 16.8 | 1.16 | `-.015em` |
| `--fs-h3-lg` | 1.25 | 20 | 1.16 | `-.01em` |
| `--fs-xl` | 1.2 | 19.2 | — | — |
| *(one-off)* | .62 | 9.9 | — | `.09em` |

**Display clamps**

| Role | clamp |
|---|---|
| Hero H1 | `clamp(2.2rem, 5vw, 3.4rem)` |
| Page H1 | `clamp(2rem, 4.4vw, 2.8rem)` |
| Section H2 | `clamp(1.8rem, 3.6vw, 2.4rem)` |
| Final H2 | `clamp(1.9rem, 4vw, 2.6rem)` |
| Article H2 | `clamp(1.35rem, 2.6vw, 1.6rem)` |
| Timeline H3 | `clamp(1.25rem, 2.4vw, 1.5rem)` |
| Trust trio (≥720) | `clamp(.8rem, 1.2vw, .9rem)` |

**Weights:** 400 body · 500 nav/brand/trust · 600 buttons/labels/strong/mono · 700 headings · 800 page H1.

### 24.4 Spacing reference

| Name | px | Canonical use |
|---|---|---|
| 3XS | 4 | micro offsets |
| 2XS | 6 | badge padding |
| XS | 8 | icon gaps, small margins |
| S | 10–12 | button icon gap, heading margins |
| **M** | **18** | **all grid gaps, store-row, nav-links, carousels** |
| L | 22 | card padding |
| XL | 26 | emphasis-card padding, h3 top margin |
| 2XL | 38–40 | lede bottom, group gap |
| 3XL | 44–48 | article h2 top, mobile section padding, section-to-section |
| 4XL | 64–68 | desktop section padding, hero/story grid gap |
| 5XL | 76 | hero top |

Gutter: `24px` (all viewports). Paragraph margin: `16px`. List item margin: `9px`.

### 24.5 Radius, shadow, breakpoints, widths

| Radius | Value |
|---|---|
| `--radius-sm` | 8px |
| `--radius-md` | **14px (cards)** |
| `--radius-lg` | 20px |
| controls | 12px |
| nav CTA | 9px |
| metadata / focus | 6px |
| accent stripe | `4px 0 0 4px` |
| pills | 999px |
| dots / arrows | 50% |

| Shadow | Value |
|---|---|
| `--neu` | `5px 5px 30px rgba(174,174,174,.40), -10px -10px 30px rgba(255,255,255,.71)` |
| `--neu-soft` | `4px 4px 22px rgba(174,174,174,.30), -8px -8px 22px rgba(255,255,255,.71)` |
| adjacency | `4px 4px 14px rgba(174,174,174,.35), -4px -4px 14px rgba(255,255,255,.6)` |
| press | `2px 2px 14px rgba(174,174,174,.4)` / `2px 2px 8px rgba(174,174,174,.35)` |
| input inset | `inset 2px 2px 8px rgba(174,174,174,.18), inset -2px -2px 8px rgba(255,255,255,.7)` |
| receipt | `var(--neu), 0 14px 34px rgba(0,0,0,.10)` |

| Breakpoint | Trigger |
|---|---|
| 920px | hero / story grids collapse |
| 860px | 3-up grids collapse, **nav links hide**, footer → 2-up |
| 720px | section padding 68→48, search full width |
| 640px | pro rows / post rows collapse |
| 600px | timeline padding 56→40 |
| 520px | footer → 1-up, shots 240→200 |
| ≥720px (min) | trust-trio single row |

| Width | Value |
|---|---|
| Frame | 1080px |
| Content | 1032px |
| Gutter | 24px |
| Article measure | 900px *or* 720px (§5.2) |
| Prose / lede caps | 760 · 720 · 640 · 600 · 560 · 530 · 520 · 300 |

| Component dimension | Value |
|---|---|
| Logo | 19 × 20 |
| Brand mark | 26 × 26 |
| Feature icon container | 46 × 46 (svg 23 × 23) |
| Footer icon | 14 × 14 |
| Carousel arrow | 40 × 40 |
| Badge logo height | 44 |
| Badge card min-height | 56 |
| Screenshot card | 240 (200 ≤520px), ratio 1179:2556 |
| Review card | `calc((100% - 36px)/3)`; open `×2 + 18px`; 280 ≤860px |
| Timeline dot | 13 (2px `--action` ring) |
| Trust dot | 7 |
| Status/bullet dot | 6 |
| Nav touch target | 44 min-height |
| Stroke width (all icons) | 1.8 |

---

## 25. Existing Website Pattern Library

### 25.1 Hero — Split narrative + proof object
**Homepage only.**
`.hero` `76px 0 64px`, `overflow:hidden`, with an 8%-orange radial glow at `top:-220px; right:-160px`.
`.hero-grid` = `1.1fr .9fr`, gap 64px → 1 column ≤920px.
Left: `.trust-trio` → H1 (800, green `<em>`) → `.hero-sub` (18px/530px, one `<strong>`) → `.store-row`.
Right: the proof object — currently `.receipt` + `.receipt-caption`.
**Use when:** a page needs to establish the whole proposition at once. **Content:** one promise, one mechanism, one proof, two store buttons.

### 25.2 Page head — Title + lede
**Blog index, utility pages.**
`.page-head` `64px 0 0` (44 mobile). H1 `clamp(2rem,4.4vw,2.8rem)`/800/760px + `.section-lede` with `margin-bottom:0`.
**Use when:** the page is a destination, not a pitch. No prop, no CTA in the head.

### 25.3 Timeline — A day, in moments
`.day` + `.moment` (see §6.10). 5–6 moments, each: mono blue timestamp → problem H3 → scene → answer with `<strong>` → 3–4 chips.
**Use when:** explaining a process, a workflow, or a set of features through lived experience rather than a feature list. Reused in articles for step-by-step instructions (with `.n` numbered step pills instead of timestamps).
**Responsive:** left padding 56→40 ≤600px; nothing else changes.

### 25.4 Card grid — Three up
`.today-grid` / `.bench-grid`: `repeat(3,1fr)`, gap 18px → 1 column ≤860px. Cards are `.today-card` (icon → H3 → 15.2px body) or `.bench-card` (status pill → H3 → body).
**Use when:** three parallel, equal-weight points. **Never 2-up, never 4-up.** If you have 4–6 items, use two labelled groups separated by `.merged-gap`.

### 25.5 Emphasis block — The one that matters
`.pro-card` / `.post-cta` / `.featured`: white, 14px radius, `--neu`, `26px 22px`, with a 4px `--accent` stripe on the left edge.
Inside `.pro-card`: `.pro-head` (H3 + status pill) → `.pro-intro` → `<dl class="pro-rows">` of `190px 1fr` key/value rows on dashed rules → `.pro-foot` (green dot + guarantee) → optional `.waitlist`.
**Use when:** exactly one block per page must dominate. **Content:** the paid tier, the featured article, the in-article conversion moment.

### 25.6 Split text/data — The story band
`.story`: full-bleed `--card` band with hairline top/bottom borders. `.story-grid` = `1fr 1fr`, gap 64px → 1 column ≤920px.
Left: eyebrow → H2 → paragraphs → `.rule` pull-quote (3px orange left border, 18px/700) → attribution line.
Right: `.ledger` — `--bg` fill, 20px radius, mono, a periwinkle label pill, then dashed `.ledger-row`s of `when / what / amount(green, tabular)`, closing with a 12px `.foot` provenance note.
**Use when:** telling origin, method, or results with supporting numbers. **This is the only background-band section on the site.**

### 25.7 Carousel — Horizontal card scroll
`.carousel-head` (content left, arrows right) → `.shots-viewport`/`.revs-viewport` → flex track with 18px gaps, hidden scrollbar, scroll-snap.
Two calibrations: screenshots = fixed 240px + `mandatory`; reviews = exactly 3 per viewport + `proximity` + expandable cards + JS height-hugging.
**Use when:** 5+ homogeneous items that reward browsing but not comparison. **Never** for primary content or navigation.

### 25.8 FAQ
`.faq` at 760px, native `<details>`, mono `+`/`–` in `--action`, 640px answers, closing with a `.faq-more` link to the full FAQ page. Always mirrored in `FAQPage` JSON-LD.
**Use when:** answering real objections. 5–8 questions inline; link out for more.

### 25.9 Article
```
nav
.post (68/48)
  .post-back  ← Back to Blog
  .post-updated  Last updated: 4 July 2026
  h1 (clamp 2–2.8rem, 800)
  .post-meta   date · tag · read-time
  .art-lede    18px, one <strong> on the reader's real question
  .store-row
  blockquote   founder quote, 3px orange border
  hr.tear
  <section> … 48px apart, each opening with an H2
  .cmp table   comparison (periwinkle header)
  .day/.moment step instructions
  FAQ section
  .related     dashed link list
  .post-cta    emphasis card + store-row
  .author-card standard card, mono A-LABEL + bio
footer
```
**Metadata required:** see §25.14.

### 25.10 Blog index
```
nav
.page-head          Blog / Tips, guides and updates for resellers / lede
section
  .group-label      LATEST
  .featured         emphasis card linking the flagship post
  .merged-gap
  .group-label      ALL POSTS · newest first
  .toolbar          .filters (pills, aria-pressed) + .blog-search (right, full-width ≤720px)
  .filter-count     "47 posts"
  ul.post-list      .post-row hover-cards
  .no-posts         empty state
.tear
.final + .newsletter
footer
```
Filtering and search are client-side via `.post-row.hide`. No pagination.

### 25.11 Final CTA
`.final` — centred. H2 `clamp(1.9rem,4vw,2.6rem)` → 520px paragraph → centred `.store-row` → centred `.trust-trio` (20px above) → `.newsletter` (52px top margin, 38px top padding over a dashed rule, 520px, H3 + 15.2px line + inline form + 12px fine print).
**Use on every page.** This is the site's universal closer.

### 25.12 Logo / social proof strip
`.badges` — `46px 0` (34 ≤520px), centred `.group-label`-style heading, `.badges-row` of `.badge-card`s at 16px gaps with 44px-height artwork and the adjacency shadow.
**Use when:** third-party validation exists. Homepage only, below the final CTA.

### 25.13 Footer
Four columns (`1.6fr 1fr 1fr 1fr`), brand + positioning line, then `Explore` / `Follow` / `Help & legal`, then a dashed `.foot-bottom` with the community link and the copyright line.

**Copy the footer block verbatim from an existing page.** The complete content spec is in §6.12. The only value you may change is the brand `href` (`#top` on the homepage, `/` elsewhere). Do not add a CTA, a press list, a newsletter form, or page-specific links.

### 25.14 Metadata pattern *(added v1.1)*

Every page carries the same head skeleton, in this order:

```
charset · viewport · title · meta description
apple-itunes-app · favicon · canonical
OpenGraph block · Twitter Card block
font preconnect ×2 · font stylesheet
JSON-LD block(s)
<style>
```

| Field | Homepage | Blog index | Article |
|---|---|---|---|
| `canonical` | `https://flipperhelper.app/` | `…/blog/` | full article URL |
| `og:type` | `website` | `website` | `article` |
| `article:*` | — | — | `published_time`, `author`, `section` |
| `apple-itunes-app` | ✅ | ✅ *(optional)* | ✅ |
| Favicon | ✅ | ✅ | ✅ |
| JSON-LD | `SoftwareApplication` + `FAQPage` | `BreadcrumbList` + `Blog` | `BreadcrumbList` + `Article` + `FAQPage` |

**Rules:**
- `og:locale` is always `en_GB`. `og:image` is always `https://flipperhelper.app/logo_FH.png`. `og:site_name` is always `FlipperHelper`.
- **Escape ampersands** in `content="…"` as `&amp;` — a raw `&` in an attribute is invalid HTML.
- **Every `FAQPage` entry must exist verbatim as visible text on the page.** Structured data that isn't rendered is a search-engine policy violation, and it also breaks the honesty principle in §11.
- **Never put a rating in JSON-LD that isn't displayed on the page.** The homepage's `aggregateRating` is deliberately omitted for this reason — see Appendix A, residual item 4.
- All internal links are root-absolute (`/faq.html`, `/tools/`), except sibling article links inside `/blog/`, which stay relative.

---

## Appendix A — Change log and residual items

### A.1 Resolved in v1.1 / v1.2

v1.0 recorded these as drift. They are now fixed in the source files. **No token, colour, radius, shadow, type size or spacing value was touched** — every change is structural, semantic or metadata.

| # | Was | Now | Files |
|---|---|---|---|
| 1 | Nav order and labels differed across all three files (`Tools` vs `Free tools`; FAQ in three positions; `Home` on some pages only) | **v1.2:** all three pages carry the homepage's nav verbatim — `Your Sunday · Our story · What's next · FAQ · Blog · Free tools · [Get the App]`, anchors prefixed with `/` off the homepage (§6.1). `Home` and `Compare` dropped from the nav — the brand lockup is the home link, and `/compare/` is reached from body copy | blog index, article |
| 2 | Article CTA linked to `/#download` — **an id that does not exist on the homepage** | `/#get`, the real section id | article |
| 3 | Mixed `../` and `/` internal links in the article | All root-absolute (`/faq.html`, `/privacy.html`, `/blog/`, `/logo_FH.svg`); sibling article links stay relative | article |
| 4 | Two article measures: `--measure:900px` vs `.prose{max-width:720px}` | One measure. The duplicate `.prose` copy was deleted with row 7; **`--measure:900px` stands unchanged**. (v1.1 briefly narrowed it to 720px — reverted in v1.2; line length is the owner's call, not a consistency fix) | article |
| 5 | `.backlink` and `.post-back` — two names, identical styles | `.post-back` only; `.backlink` removed with the blog-index strip | blog index, article |
| 6 | `.brand-mark` defined but used zero times (superseded by the inline SVG logo) | Removed | homepage, blog index |
| 7 | The blog index shipped the **entire article stylesheet** unused — `.prose`, `.art-*`, `.rule`, `.ledger-table`, `.related`, `.author-card`, `.faq*`, `.steps`, `.n`, `.who`, `.a-label` — plus an unused FAQ block | Stripped (−88 lines). Article components now live only in the article template and in this document. `.art-tag`/`.art-date` also dropped from the grouped badge selectors | blog index |
| 8 | No skip-to-content link on any page | `.skip` on all three (§6.15) | all |
| 9 | `<main>` landmark only in the article | `<main id="main">` on all three | all |
| 10 | Homepage had **no canonical, no favicon, no OpenGraph, no Twitter card, no JSON-LD** — the most-shared page on the site had no social preview | Full head block + `SoftwareApplication` and `FAQPage` JSON-LD (the FAQ entries mirror the six visible questions verbatim) | homepage |
| 11 | Blog index had no favicon and no structured data | Favicon + `BreadcrumbList` and `Blog` JSON-LD | blog index |
| 12 | Raw `&` inside the homepage `meta description` attribute (invalid HTML) | Escaped to `&amp;` | homepage |
| 13 | Unused CSS was indistinguishable from forward-looking CSS | `RESERVED` comment convention introduced (§6.16) for `.bench-grid`, `.status-building` + `@keyframes pulse`, `.rev-reply` | homepage |
| 14 | `.foot-bottom` carried a "Featured on Fazier · AlternativeTo · Indie Hackers · IndieHunt · community at r/flipperhelper" run of text links — nowhere else on the site | **v1.2:** replaced with the canonical *"Community at r/flipperhelper"*. Directory badges belong in the `.badges` section, which already carries them with artwork and hover states | blog index |
| 15 | Footer brand linked to `href="#top"` — **no `id="top"` exists on that page**, so the link did nothing | **v1.2:** `href="/"` | blog index |

**Verified after the changes:** HTML tags balanced in all three files; CSS braces balanced (269/269, 136/136, 105/105); all 7 JSON-LD blocks parse; every page has a working skip link and `#main` target; the only remaining unused selectors are the annotated `RESERVED` set plus three shared-base classes (`.mono`, `.section-title`, `.active`) that are intentionally complete on every page.

### A.2 Residual — deliberately not changed

| # | Item | Why it was left |
|---|---|---|
| 1 | `.shot .ph` screenshot placeholders still ship on the homepage | Real 1179×2556 screenshots don't exist yet. Delete the placeholder CSS when they land. |
| 2 | White on `--accent` is ~2.8:1 (fails WCAG AA) | Fixing it means changing the primary brand colour. Out of scope for a consistency pass — mitigations are in §17.2. **This is the single biggest open accessibility item.** |
| 3 | No mobile navigation below 860px | Deliberate design decision (§12.2), not drift. Note this now hides seven links below 860px instead of five — the CTA still remains, which is what the decision was built around. |
| 7 | Footer brand `href` differs (`#top` on the homepage, `/` elsewhere) | Per-page-correct, not drift: on the homepage it scrolls to top, elsewhere it must navigate home. Documented as the single permitted footer variable (§6.12). |
| 8 | `/compare/` and `/faq.html` no longer reachable from the nav | Consequence of adopting the homepage nav verbatim (row 1). `/faq.html` is reached from the homepage FAQ's "All 49 questions" link, `/compare/` from the FAQ answer and article copy. **If either needs to be a top-level destination, that is a nav decision to make deliberately — not by drift.** |
| 4 | No `aggregateRating` in the homepage JSON-LD | The page displays "4.6 · App Store · 10 ratings", so it *could* be claimed. It was omitted because the visible score covers App Store only while the review carousel mixes both stores — publishing it as a site-wide rating would overstate it. Add it later only if the on-page figure and the markup match exactly. |
| 5 | Two comparison-table components (`.ledger-table`, `.cmp`) | Both are legitimate variations with different jobs — 2-column key/value vs 3-column comparison. Not drift. |
| 6 | `.mono`, `.section-title`, `.active` unused on some pages | Part of the shared base layer, which stays complete on every page so any section can be dropped in without hunting for CSS. |

## Appendix B — Values explicitly marked estimated / inferred

| Item | Status |
|---|---|
| All contrast ratios in §2.6 and §17.2 | **computed** from the stated hex values, ±0.05 |
| Photography style guidance (§9.2) | **inferred** from tone of voice — no photographs exist on the site yet |
| Spacing scale names (XS…5XL) | **derived** — the site uses raw px values; the names are this document's abstraction over observed frequency |
| The recommendation to standardise nav order | **prescriptive**, resolving observed drift — not a value read from the CSS |
| "One emphasis card per page" | **inferred** from consistent practice across all three files, not stated in code |

---

*End of document. Everything above was read out of `flipperhelper-site-v13.html`, `blog-index.html` and `flipperhelper-blog-android-backup-v2.html`. Where it wasn't, it says so.*
