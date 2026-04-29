"""
fetch_wikipedia_candidates.py
Fetches Dutch proverb candidates from nl.wikipedia.org (MediaWiki API).
Returns a JSON array of {saying, explanation} objects to stdout.
The explanation is the <small>...</small> text directly below each proverb on the list page.

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
    return text.strip(" ./")


def extract_candidates(wikitext: str) -> list[dict]:
    """
    Extract proverb candidates with their Wikipedia explanations.
    Returns list of {saying, explanation} dicts.
    The explanation is the <small> text immediately following the proverb line.
    """
    candidates: list[dict] = []
    seen: set[str] = set()
    lines = wikitext.splitlines()

    for i, line in enumerate(lines):
        if not line.startswith("::'"):
            continue

        stripped = line.lstrip(": ")
        if stripped.lower().startswith("ook"):
            continue

        m = re.search(r"'''(.+?)'''", line)
        if not m:
            continue

        saying = clean_wikitext(m.group(1))

        if len(saying) < MIN_LEN:
            continue
        if saying.startswith("Zie:") or saying.startswith("Zie ook"):
            continue

        key = saying.lower()
        if key in seen:
            continue
        seen.add(key)

        # Look for the Wikipedia explanation in nearby lines (the <small>...</small> block)
        explanation = ""
        for j in range(i + 1, min(i + 5, len(lines))):
            next_line = lines[j]
            # Stop if we hit the next proverb entry
            if re.match(r"::'''", next_line):
                break
            cleaned = clean_wikitext(next_line)
            if len(cleaned) > 8:
                explanation = cleaned
                break

        candidates.append({"saying": saying, "explanation": explanation})

    return candidates


def main() -> None:
    all_candidates: list[dict] = []

    for page in PAGES:
        try:
            wikitext = fetch_wikitext(page)
            found = extract_candidates(wikitext)
            print(f"[{page}] {len(found)} candidates", file=sys.stderr)
            all_candidates.extend(found)
        except Exception as exc:
            print(f"ERROR fetching {page}: {exc}", file=sys.stderr)

    sample = all_candidates[:5]
    print("\nSample (first 5):", file=sys.stderr)
    for s in sample:
        print(f"  {s['saying']!r} — {s['explanation'][:60]!r}", file=sys.stderr)
    print(f"\n[{len(all_candidates)} total candidates]", file=sys.stderr)

    print(json.dumps(all_candidates, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
