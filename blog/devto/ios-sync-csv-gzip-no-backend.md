
I'm building an iOS inventory tracker. Users add items at markets — often with no mobile signal — and want to see everything in a spreadsheet on their laptop later. The app needed to be offline-first and the sync needed to just work.

## The problem with Google Sheets API

My first approach: use the Sheets API to update individual cells as users make changes. User taps a price, queue the cell update, sync when online.

Two problems killed this.

**Queueing was fragile.** When a user toggles a field quickly — yes, no, no, yes, no — the queue needs to reflect the final state, not deduplicate away intermediate changes. I hit a bug where deduplication logic was collapsing the queue incorrectly, sending stale values. Fixing it properly meant building a mini sync engine for what is essentially a data export.

**Google's permission model.** The Sheets API has no restricted scope. If your app can read one spreadsheet, it can read every spreadsheet on the user's account. The OAuth consent screen would say "allow this app to read and edit ALL your spreadsheets." That's a terrible first impression.

To get this scope approved, Google requires video verification — record a demo, explain why you need access, wait for manual review. I had users on a waitlist. Spending weeks on Google verification while they lose interest was not an option.

## The CSV-to-Drive approach

Instead of updating cells one by one, I upload the entire inventory as a single CSV file to Google Drive. The trick: set the MIME type to `application/vnd.google-apps.spreadsheet` and Google converts it into a Sheets document automatically.

The Google Drive `drive.file` scope only allows your app to access files it created — it cannot touch anything else on the user's Drive. This scope is **auto-approved with no verification required**. No video demo, no waiting, no scary consent screen.

From the user's perspective nothing changed. They get a spreadsheet link, open it, see all their items with prices and calculations. They don't care that it's a CSV behind the scenes.

## The file size problem and GZIP

I stress-tested the app with 100,000 inventory items. The CSV was huge. Each row implicitly carries the weight of column headers, commas, and quotes. Uploading this over mobile every time the user closes the app was not going to work.

At a previous job I'd seen microservices communicate with `Content-Encoding: gzip` headers — compressed traffic between APIs to reduce latency. I knew the concept but hadn't applied it to file uploads.

Before GZIP, I spent time manually optimising the CSV — truncating column headers, stripping null values, omitting trailing empty fields. Google Drive supports all of this. But once I added GZIP encoding, all of that manual work became pointless. **GZIP gave approximately 20x compression.** The algorithm handles repetitive text patterns (which CSV is full of) far better than any manual optimisation.

Swift has built-in GZIP support through the Compression framework, so implementation was minimal — compress the data, add the content encoding header, upload.

## Fitting sync into iOS background tasks

iOS is strict about background work. Two main options:

- **BGProcessingTask** — runs overnight when charging. Timing is unpredictable, might not run if battery is low
- **beginBackgroundTask** — gives ~30 seconds when the user closes the app

I went with the 30-second window. When the user closes the app, it builds the CSV, compresses with GZIP, compares against the last uploaded version, and uploads if needed. 100,000 items sync comfortably within the limit.

The comparison is simple: keep a hash of the last successfully uploaded CSV. On app close, build new CSV, hash it, compare. Same hash = no upload needed. Different = compress and upload.

Same sync triggers on app launch too, so data stays current from both directions.

## Photos are handled separately

Inventory photos follow a different path. Each photo is compressed using iOS built-in image processing (~10x size reduction) and queued for upload individually. The queue processes photos progressively — on launch, close, and in the background.

If a user adds 50 photos at once, they upload gradually. Photos go to Google Drive alongside the CSV, under the same `drive.file` scope.

## The architecture that emerged

What started as a shortcut turned into something genuinely simpler and more robust:

- **Offline-first** — all data lives on the phone. Works with no internet, which matters at outdoor markets
- **No backend** — zero infrastructure, zero running costs. Google Drive is the only dependency and it's the user's own storage
- **Auto-approved permissions** — `drive.file` scope means no Google verification, no scary consent screens
- **Sync is a view, not a source of truth** — the spreadsheet is an export. If it breaks, phone data is safe. No sync conflicts
- **Optional** — originally required Google sign-in. Now sync is entirely optional

Is this permanent? Probably not at scale. But 100,000 items holds up under stress testing. That's years of headroom. By the time it's outgrown, it'll be clear whether building something more complex is worth it.

## Key takeaway

I usually try to make the technical solution perfect before moving on. This time I had users waiting and couldn't afford to. The shortcut turned out to be better than the "proper" approach would have been — simpler permissions, no backend costs, works offline, syncs fast.

Sometimes the temporary workaround is the architecture. The trick is knowing when to stop optimising and ship.


