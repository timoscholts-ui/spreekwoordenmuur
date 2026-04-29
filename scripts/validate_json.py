"""
validate_json.py
Reads a JSON string from stdin, validates required fields.
Exit 0 = VALID, exit 1 = INVALID.
"""

import json
import sys

REQUIRED = {"saying", "literalDunglish", "contextNl", "explanationEn", "type"}
VALID_TYPES = {"spreekwoord", "gezegde", "citaat"}


def main() -> None:
    raw = sys.stdin.read().strip()
    try:
        obj = json.loads(raw)
    except json.JSONDecodeError as exc:
        print(f"INVALID: JSON parse error: {exc}")
        sys.exit(1)

    missing = REQUIRED - obj.keys()
    if missing:
        print(f"INVALID: missing fields: {missing}")
        sys.exit(1)

    for field in REQUIRED:
        if not isinstance(obj[field], str) or not obj[field].strip():
            print(f"INVALID: field '{field}' is empty or not a string")
            sys.exit(1)

    if obj["type"] not in VALID_TYPES:
        print(f"INVALID: type must be one of {VALID_TYPES} (got '{obj['type']}')")
        sys.exit(1)

    print("VALID")
    print(json.dumps(obj, ensure_ascii=False, indent=2))
    sys.exit(0)


if __name__ == "__main__":
    main()
