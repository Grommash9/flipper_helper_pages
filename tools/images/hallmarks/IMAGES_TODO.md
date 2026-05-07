# Hallmark images — drop-in slots

The wizard auto-loads `<category>-<slug>.{png|svg|jpg}` from this folder.
Filenames must match the slug in `tools/uk-silver-hallmarks.html` exactly. Missing files fall back to a text glyph in the card — the tool works without images and upgrades automatically when a file appears.

## Status (2026-05-06)

### ✅ Filled — own / sourced images

| Slot | Source |
|---|---|
| `standard-lion-passant.png` | Oleksandr |
| `standard-britannia.png` | Oleksandr |
| `standard-lion-rampant.png` | Oleksandr |
| `standard-thistle.png` | Oleksandr |
| `standard-crowned-harp.png` | Oleksandr |
| `standard-num-925.png` | Oleksandr |
| `standard-num-958.png` | Oleksandr |
| `standard-num-950.png` | Oleksandr |
| `standard-num-800.png` | Oleksandr |
| `standard-num-999.png` | Oleksandr |
| `town-anchor.png` | Oleksandr (Birmingham hallmark) |
| `town-leopard-uncrowned.png` | Oleksandr (London) |
| `town-leopard-crowned.png` | Oleksandr (London 1478–1821) |
| `town-three-castles-newcastle.png` | Oleksandr (Newcastle, closed 1884) |
| `town-castle-exeter.png` | Oleksandr (Exeter, closed 1883) |
| `town-wheat-sword-chester.png` | Oleksandr (Chester, closed 1962) |
| `duty-victoria.png` | Oleksandr (Queen Victoria duty profile, 1837–1890) |
| `town-lions-york.png` | Oleksandr (York, closed 1858) |
| `duty-george-iii.png` | Oleksandr (George III duty profile, 1784–1820) |
| `duty-george-iv.png` | Oleksandr (George IV duty profile, 1820–1830) |
| `duty-william-iv.png` | Oleksandr (William IV duty profile, 1830–1837) |
| `town-castle-edinburgh.png` | Oleksandr (Edinburgh three-towered castle, 1457–present) |
| `town-tree-fish-bell.png` | Oleksandr (Glasgow, closed 1964) |
| `town-dublin.png` | Crowned harp (mirrors `standard-crowned-harp.png`) |
| `town-dublin-hibernia.png` | Composite: Crowned Harp + Hibernia (Dublin 1730+) |
| `town-crown-sheffield.png` | Oleksandr (pre-1975 Sheffield) |
| `town-rose-sheffield.svg` | CC BY-SA 3.0 — [Yorkshire rose](https://commons.wikimedia.org/wiki/File:Yorkshire_rose.svg) |
| `commemorative-jubilee-1935.png` | Oleksandr |
| `commemorative-coronation-1953.png` | Oleksandr |
| `commemorative-silver-jubilee-1977.png` | Oleksandr |
| `commemorative-millennium-2000.png` | Oleksandr |
| `commemorative-diamond-jubilee-2012.png` | Oleksandr |
| `commemorative-platinum-jubilee-2022.png` | Oleksandr |
| `commemorative-charles-iii-2023.png` | Oleksandr |
| `generic-set.png` | CC BY-SA 3.0 — British hallmarks composite |

Sources for the Oleksandr-supplied set live untouched in `/new_images/` (gitignored).

### ⏳ Still needed

If you find better quality images later, just overwrite the file (same filename) — no code change needed.

#### Standard mark (purity)
- `standard-num-900.png` — `900` numerical stamp (Russian / Eastern European / coin silver)
- `standard-num-833.png` — `833` numerical stamp (Portuguese / Scandinavian)

#### Town mark (Assay Office)
*(none — all town slots filled)*

#### Solid vs plated (Step 1)
- `solid-solid.png` — generic solid silver mark cluster
- `solid-plated.png` — generic plate mark cluster (EPNS, A1)
- `solid-unsure.png` — side-by-side comparison illustration

#### Duty mark (sovereign's head)
- `duty-any.png` — generic monarch silhouette (the "Some monarch profile, 1784–1890" fallback card)

## Where to source the missing images

### Best free / CC-licensed sources (preferred)

1. **Wikimedia Commons** — `commons.wikimedia.org` — search `<mark name> hallmark`. CC-BY-SA mostly.
2. **Public domain historical books on Commons / archive.org**:
   - *Chats on old silver* (Hayden, public domain) — has plate-after-plate of UK hallmark drawings
   - *Hall marks on gold & silver plate* (Chaffers, public domain) — comprehensive reference
   - *Old English plate, ecclesiastical, decorative, and domestic* (Cripps, public domain)
   - *Old London silver* (Howard, public domain)
   - These need PDF page extraction → individual mark crops.

### Authoritative-but-copyrighted sources (link only, do not embed without permission)

3. **The Assay Office London** — `theassayofficelondon.co.uk/about/history/date-letters/`
4. **Birmingham Assay Office** — `theassayoffice.co.uk/services/identification/silver-hallmarks/`
5. **The Sheffield Assay Office** — `assayoffice.co.uk/about/history-of-the-sheffield-assay-office/`
6. **Edinburgh Assay Office** — `edinburghassayoffice.co.uk/hallmarking/date-letters/`
7. **Goldsmiths' Company** — `thegoldsmiths.co.uk` — image library; usage permissions may need request.

### Practical alternative: original photos

8. **Photograph hallmarks on real pieces.** A few macro shots (10× loupe + phone camera) of pieces from your wife's reselling stock would be ideal — entirely original, fully owned, unambiguously usable. Likely the highest-quality option for the slots Commons doesn't cover.

## File specs

- Format: PNG preferred (the auto-loader also accepts SVG and JPG fallbacks)
- Aspect: square (cards are 60×60 in the wizard — image is fitted, not cropped)
- Size: 240×240 to 480×480 source, optimised PNG; under ~150 KB per file is plenty
- Background: transparent or light — neutral so cards on `#f4ead6` chip backing look clean
- Naming: `<category>-<slug>.png`. Slugs match the wizard data — see this file's table above.

## How to replace an image

1. Save the new image as the exact filename (e.g. `standard-britannia.png`) in this folder
2. Overwrite the old file
3. No code change needed — the wizard loader picks it up on next page load

## Manifest

`MANIFEST.json` in this folder records license + attribution for the older auto-downloaded files (where applicable). Update it when you swap CC-licensed images.
