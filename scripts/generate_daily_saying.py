"""
generate_daily_saying.py
Daily generator for Spreekwoordenmuur.
Uses the local `claude` CLI session (no API key needed).

Exit codes:
  0 = new saying produced and written (or DRY_RUN=1)
  1 = already published today
  2 = fatal error
"""

import datetime
import io
import json
import logging
import os
import random
import re
import subprocess
import sys
from contextlib import redirect_stdout
from pathlib import Path
from urllib.parse import quote

from dotenv import load_dotenv

SCRIPT_DIR = Path(__file__).parent
PROJECT_DIR = SCRIPT_DIR.parent
DATA_DIR = PROJECT_DIR / "src" / "data"
LOGS_DIR = PROJECT_DIR / "logs"

SAYINGS_PATH = DATA_DIR / "sayings.json"
INDEX_PATH = DATA_DIR / "index.json"

load_dotenv(PROJECT_DIR / ".env")

DRY_RUN = os.getenv("DRY_RUN", "0") == "1"

# Path to claude CLI — auto-detected, can override via CLAUDE_PATH env var
CLAUDE_PATH = os.getenv("CLAUDE_PATH", "claude")

MAX_CANDIDATES_TO_TRY = 10
MAX_ATTEMPTS_PER_CANDIDATE = 3


def setup_logging() -> None:
    LOGS_DIR.mkdir(exist_ok=True)
    today = datetime.date.today().isoformat()
    log_file = LOGS_DIR / f"generator-{today}.log"
    logging.basicConfig(
        level=logging.INFO,
        format="%(levelname)s | %(message)s",
        handlers=[
            logging.FileHandler(log_file, encoding="utf-8"),
            logging.StreamHandler(sys.stderr),
        ],
    )


def load_existing() -> tuple[list[dict], list[dict]]:
    sayings = json.loads(SAYINGS_PATH.read_text("utf-8")) if SAYINGS_PATH.exists() else []
    index = json.loads(INDEX_PATH.read_text("utf-8")) if INDEX_PATH.exists() else []
    return sayings, index


def is_already_today(index: list[dict]) -> bool:
    today = datetime.date.today().isoformat()
    return any(e.get("dateISO") == today for e in index)


def fetch_candidates() -> list[str]:
    sys.path.insert(0, str(SCRIPT_DIR))
    import fetch_wikipedia_candidates as fwc  # type: ignore[import]

    buf = io.StringIO()
    with redirect_stdout(buf):
        fwc.main()
    return json.loads(buf.getvalue())


def normalize_key(saying: str) -> str:
    return re.sub(r"[^a-z0-9]", "", saying.lower())


def dedupe(candidates: list[str], index: list[dict]) -> list[str]:
    known = {e.get("normalizedKey", "") for e in index}
    return [c for c in candidates if normalize_key(c) not in known]


def make_slug(saying: str, date_iso: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", saying.lower()).strip("-")[:40]
    return f"{date_iso}-{slug}"


def call_claude(saying: str) -> dict:
    prompt = (
        f"Generate a JSON object for the Dutch proverb: \"{saying}\"\n\n"
        f"Return ONLY a JSON object with these exact fields:\n"
        f"- saying: the proverb exactly as given\n"
        f"- literalDunglish: a hilariously literal word-for-word English translation "
        f"(keep Dutch word order, Louis van Gaal style)\n"
        f"- contextNl: one natural Dutch sentence using this proverb in context\n"
        f"- explanationEn: one clear English sentence explaining the meaning\n"
        f"- type: either \"spreekwoord\" or \"gezegde\"\n\n"
        f"Return ONLY the JSON object. No explanation. No markdown."
    )

    result = subprocess.run(
        [CLAUDE_PATH, "-p", prompt],
        capture_output=True,
        text=True,
        encoding="utf-8",
        timeout=60,
    )

    if result.returncode != 0:
        raise RuntimeError(f"claude CLI exited {result.returncode}: {result.stderr.strip()}")

    raw = result.stdout.strip()
    # Strip markdown fences if present
    raw = re.sub(r"^```[a-z]*\n?", "", raw)
    raw = re.sub(r"\n?```$", "", raw)

    # Extract first JSON object from output
    m = re.search(r"\{.*\}", raw, re.DOTALL)
    if not m:
        raise ValueError(f"No JSON object found in output: {raw[:200]}")

    return json.loads(m.group())


def validate(record: dict) -> None:
    required = {"saying", "literalDunglish", "contextNl", "explanationEn", "type"}
    missing = required - record.keys()
    if missing:
        raise ValueError(f"Missing fields: {missing}")
    for field in required:
        if not isinstance(record[field], str) or not record[field].strip():
            raise ValueError(f"Field '{field}' is empty")
    if len(record["contextNl"].split()) < 4:
        raise ValueError("contextNl too short")
    if len(record["explanationEn"].split()) < 3:
        raise ValueError("explanationEn too short")
    if record["type"] not in ("spreekwoord", "gezegde", "citaat"):
        raise ValueError(f"Invalid type: {record['type']}")


def perplexity_url(saying: str) -> str:
    q = quote(f"{saying} spreekwoord betekenis")
    return f"https://www.perplexity.ai/search?q={q}"


def main() -> None:
    setup_logging()
    log = logging.getLogger()

    log.info("=== Spreekwoordenmuur daily generator ===")

    sayings, index = load_existing()
    log.info(f"Loaded {len(sayings)} existing sayings, {len(index)} index entries")

    if is_already_today(index):
        log.info("Already published today. Exiting.")
        sys.exit(1)

    try:
        raw_candidates = fetch_candidates()
    except Exception as exc:
        log.error(f"Failed to fetch candidates: {exc}")
        sys.exit(2)

    candidates = dedupe(raw_candidates, index)
    log.info(f"After dedupe: {len(candidates)} fresh candidates (of {len(raw_candidates)} fetched)")

    if not candidates:
        log.error("No candidates left after deduplication.")
        sys.exit(2)

    random.shuffle(candidates)
    today = datetime.date.today()
    final_record: dict | None = None
    chosen_saying: str = ""

    for i, saying in enumerate(candidates[:MAX_CANDIDATES_TO_TRY], 1):
        log.info(f"--- Trying candidate {i}/{min(len(candidates), MAX_CANDIDATES_TO_TRY)}: '{saying}' ---")
        for attempt in range(1, MAX_ATTEMPTS_PER_CANDIDATE + 1):
            try:
                record = call_claude(saying)
                validate(record)
                log.info(f"Output validated on attempt {attempt}")
                final_record = record
                chosen_saying = saying
                break
            except Exception as exc:
                log.warning(f"Attempt {attempt} failed: {exc}")
        if final_record:
            break
    else:
        log.error("All candidates exhausted. Generator failed.")
        sys.exit(2)

    date_iso = today.isoformat()
    date_display = today.strftime("%d/%m/%y")
    slug = make_slug(chosen_saying, date_iso)

    full_record = {
        "id": slug,
        "dateISO": date_iso,
        "dateDisplay": date_display,
        "saying": final_record["saying"],
        "literalDunglish": final_record["literalDunglish"],
        "contextNl": final_record["contextNl"],
        "explanationEn": final_record["explanationEn"],
        "type": final_record.get("type", "spreekwoord"),
        "askPerplexityUrl": perplexity_url(chosen_saying),
    }

    index_entry = {
        "id": slug,
        "normalizedKey": normalize_key(chosen_saying),
        "dateISO": date_iso,
    }

    log.info(f"Produced new record: {slug}")
    print(json.dumps(full_record, ensure_ascii=False, indent=2))

    if DRY_RUN:
        log.info("DRY_RUN=1 — not writing files.")
        sys.exit(0)

    sayings.append(full_record)
    index.append(index_entry)

    SAYINGS_PATH.write_text(
        json.dumps(sayings, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    INDEX_PATH.write_text(
        json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    log.info("Wrote sayings.json and index.json")
    sys.exit(0)


if __name__ == "__main__":
    main()
