# flipperhelper.app

Static marketing site for FlipperHelper — plain HTML and CSS, no build step, served by
GitHub Pages from `main` (domain in `CNAME`).

## Saving your work

```sh
./save-progress.sh                  # commits everything you changed
./save-progress.sh "new blog post"  # ...with your own message
```

That only saves locally. To put the site live:

```sh
git push origin main
```

A `pre-commit` hook runs on every commit and takes care of two things people forget:

- stages edits to files already in the repo, so nothing is left behind;
- re-runs `node build-search-index.js` when any HTML changed, so site search matches the
  page titles. Brand-new files are never added automatically — the hook lists them instead.

Committing with nothing staged still stops once ("no changes added to commit") because git
looks at the staged list before the hook runs — the hook says so, and the same command works
the second time. `FH_NO_AUTOSTAGE=1 git commit …` commits exactly what you staged yourself.

Hooks live outside version control, so the copy git actually runs has to be installed once
per clone:

```sh
cp githooks/pre-commit .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
```

## Previewing locally

```sh
python3 -m http.server 8777       # then open http://localhost:8777/
```

## Generated files — don't edit by hand

| File | Regenerate with |
|---|---|
| `search-index.json` | `node build-search-index.js` (automatic on commit) |
| `compare/*.html` | `node build-compare-pages.js` |
| city landing pages | `node build-cities-pages.js` |

## The home page

`index.html` uses its own stylesheet, `landing.css` — every other page shares `styles.css`.
The email boxes (Pro waitlist, The Weekly Flip) post straight to the MailerLite form for
account `2150674`; the `<head>` carries the SEO meta and JSON-LD, so if the visible reviews,
rating or FAQ change, update the matching JSON-LD block too.
