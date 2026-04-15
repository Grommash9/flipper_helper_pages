#!/usr/bin/env python3
"""
Submit all URLs from sitemap.xml to IndexNow (Bing + Yandex + Seznam + Naver).

Why this exists:
  - grommash9.github.io is a GitHub Pages subdomain — no CMS integration.
  - IndexNow is protocol-based: one POST per ship, done.
  - The LLM visibility audit on 2026-04-15 showed our website was not being
    cited by ChatGPT/Perplexity's web search (they index from Bing).
    IndexNow pushes URLs straight to Bing's index.

Usage:
  python3 indexnow_submit.py

The key file lives at the website root so /{KEY}.txt is publicly reachable.
If you rotate the key, update KEY below, rename the .txt file, commit, push,
then re-run this script.
"""
import sys
import json
import urllib.request
import urllib.error
from pathlib import Path
from xml.etree import ElementTree as ET

HOST = "grommash9.github.io"
BASE_PATH = "/flipper_helper_pages"
KEY = "38075ea95ee84541a32c8acf493aa478"
KEY_LOCATION = f"https://{HOST}{BASE_PATH}/{KEY}.txt"
SITEMAP = Path(__file__).parent / "sitemap.xml"
ENDPOINT = "https://api.indexnow.org/indexnow"

SITEMAP_NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}


def read_urls_from_sitemap(path: Path) -> list[str]:
    tree = ET.parse(path)
    root = tree.getroot()
    return [loc.text.strip() for loc in root.findall("sm:url/sm:loc", SITEMAP_NS) if loc.text]


def submit(urls: list[str]) -> None:
    payload = {
        "host": HOST,
        "key": KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": urls,
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        ENDPOINT,
        data=data,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8", errors="replace")
            print(f"HTTP {resp.status}")
            if body:
                print(body)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"HTTP {e.code}: {e.reason}", file=sys.stderr)
        if body:
            print(body, file=sys.stderr)
        sys.exit(1)


def main() -> None:
    urls = read_urls_from_sitemap(SITEMAP)
    print(f"Submitting {len(urls)} URLs to IndexNow:")
    for u in urls:
        print(f"  {u}")
    print()
    submit(urls)


if __name__ == "__main__":
    main()
