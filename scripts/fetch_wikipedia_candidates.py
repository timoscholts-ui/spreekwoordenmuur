"""
fetch_wikipedia_candidates.py
Fetches Dutch proverb candidates from nl.wikipedia.org (MediaWiki API).
Returns a list of clean proverb strings to stdout (JSON array).

Usage:
    python fetch_wikipedia_candidates.py
"""

import json
import re
import sys

import requests

WIKI_API = "https://nl.wikipedia.org/w/api.php"
HEADERS = {"User-Agent": "spreekwoordenmuur/1.0 (local dev)"}

PAGES = [
    "Lijst_van_Nederlandse_spreekwoorden_A-E",
    "Lijst_van_Nederlandse_spreekwoorden_F-J",
    "Lijst_van_Nederlandse_spreekwoorden_K-O",
    "Lijst_van_Nederlandse_spreekwoorden_P-U",
    "Lijst_van_Nederlandse_spreekwoorden_V-Z",
]

MIN_LEN = 9


def fetch_wikitext(page: str) -> str:
    r = requests.get(
        WIKI_API,
        headers=HEADERS,
        params={
            "action": "parse",
            "page": page,
            "prop": "wikitext",
            "format": "json",
            "formatversion": "2",
        },
        timeout=20,
    )
    r.raise_for_status()
    data = r.json()
    if "error" in data:
        raise RuntimeError(f"MediaWiki error for '{page}': {data['error']}")
    return data["parse"]["wikitext"]


def clean_wikitext(text: str) -> str:
    text = re.sub(r"\[\[[^\]|]+\|([^\]]+)\]\]", r"\1", text)
    text = re.sub(r"\[\[([^\]]+)\]\]", r"\1", text)
    text = re.sub(r"\{\{[^}]*\}\}", "", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    text = text.strip(" ./")
    return text


def extract_candidates(wikitext: str) -> list[str]:
    candidates = []
    seen: set[str] = set()

    for line in wikitext.splitlines():
        if not line.startswith("::'"):
            continue
        stripped = line.lstrip(": ")
        if stripped.lower().startswith("ook"):
            continue
        m = re.search(r"'''(.+?)'''", line)
        if not m:
            continue
        text = clean_wikitext(m.group(1))
        if len(text) < MIN_LEN:
            continue
        if text.startswith("Zie:") or text.startswith("Zie ook"):
            continue
        key = text.lower()
        if key in seen:
            continue
        seen.add(key)
        candidates.append(text)

    return candidates


def main() -> None:
    all_candidates: list[str] = []

    for page in PAGES:
        try:
            wikitext = fetch_wikitext(page)
            found = extract_candidates(wikitext)
            print(f"[{page}] {len(found)} candidates", file=sys.stderr)
            all_candidates.extend(found)
        except Exception as exc:
            print(f"ERROR fetching {page}: {exc}", file=sys.stderr)

    sample = all_candidates[:20]
    print("\nSample (first 20):", file=sys.stderr)
    for s in sample:
        print(f"  {s}", file=sys.stderr)
    print(f"\n[{len(all_candidates)} total candidates]", file=sys.stderr)

    print(json.dumps(all_candidates, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
