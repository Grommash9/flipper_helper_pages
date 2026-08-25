# Design docs

Not part of the published site — reference material for building pages consistently.

- `design-system.md` — the Website Design System & AI Style Guide. Reverse-engineered from
  the mocks below; the single source of truth for colour, type, spacing, components, tone of
  voice, and the rules another AI should follow when building a new page. Load this file into
  a fresh chat before creating a page.
- `design-system.html` — the same guide as a web page, rendered in the design system it
  documents. Self-contained (fonts embedded), opens straight from disk.
- `mocks/` — the standalone mocks the guide was derived from. Each is a single file with its
  CSS inline, so it opens without a server. **The live pages use `/landing.css` instead** —
  when a mock and a live page disagree, the live page wins and the mock is the older artefact.

`faq.html` at the repo root was built from `mocks/faq-v2.html`, ported onto `/landing.css`.
