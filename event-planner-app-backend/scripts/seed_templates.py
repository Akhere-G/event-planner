"""Seed the premade public trip templates from a JSON file.

    python scripts/seed_templates.py           # seed data/premade_templates.json
    python scripts/seed_templates.py --check   # validate only, no database needed
    python scripts/seed_templates.py --file other.json

Re-running is safe: templates are matched by slug and updated in place.
"""

import argparse
import os
import sys
from pathlib import Path

from marshmallow import ValidationError

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

DEFAULT_PATH = Path(__file__).resolve().parent / "data" / "premade_templates.json"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--file", type=Path, default=DEFAULT_PATH)
    parser.add_argument(
        "--check", action="store_true", help="validate the file without seeding"
    )
    return parser.parse_args()


def main() -> int:
    from src.services.template_seed_service import (
        load_premade_templates,
        seed_premade_templates,
    )

    args = parse_args()
    try:
        templates = load_premade_templates(args.file)
    except ValidationError as err:
        print(f"Invalid templates in {args.file}:")
        for slug, messages in err.messages.items():
            print(f"  {slug}: {messages}")
        return 1

    print(f"{len(templates)} templates are valid.")
    if args.check:
        return 0

    from src import create_app

    with create_app().app_context():
        result = seed_premade_templates(templates)
    print(f"Created {result.created}, updated {result.updated}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
