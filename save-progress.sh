#!/bin/sh
# Saves everything you changed in this folder as one commit.
# It does NOT put the site live — the last line tells you the command for that.
#
#   ./save-progress.sh                  -> "Save work in progress — 24 Aug 2026, 21:40"
#   ./save-progress.sh "new blog post"  -> your own message

set -e
cd "$(dirname "$0")"

if git diff --quiet && git diff --cached --quiet &&
    [ -z "$(git ls-files --others --exclude-standard)" ]; then
    echo "Nothing to save — everything is already committed."
    exit 0
fi

git add -A
git commit -m "${1:-Save work in progress — $(date '+%d %b %Y, %H:%M')}"

branch=$(git rev-parse --abbrev-ref HEAD)
echo
echo "Saved on branch $branch."
echo "To publish the live site:  git push origin $branch"
