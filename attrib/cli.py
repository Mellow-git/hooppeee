"""Command-line entry: worker, seed, validate, demo helpers."""

from __future__ import annotations

import argparse
import logging
import sys
from collections.abc import Sequence

from attrib.config.settings import get_settings


def main(argv: Sequence[str] | None = None) -> int:
    """CLI dispatcher."""

    parser = argparse.ArgumentParser(prog="attrib")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("worker", help="run APScheduler worker")
    sub.add_parser("api", help="run API (prefer uvicorn in Docker)")
    seed_p = sub.add_parser("seed", help="regenerate fixtures from a seed")
    seed_p.add_argument("--seed", type=int, default=1)
    val_p = sub.add_parser("validate", help="run validation harness")
    val_p.add_argument("--seed", type=int, required=True)
    args = parser.parse_args(argv)

    settings = get_settings()
    logging.basicConfig(level=settings.log_level)
    if args.command == "worker":
        from attrib.collector.scheduler import run_worker

        run_worker()
        return 0
    if args.command == "api":
        import uvicorn

        uvicorn.run(
            "attrib.api.main:app",
            host=settings.api_host,
            port=settings.api_port,
        )
        return 0
    if args.command == "seed":
        from attrib.validation.world import generate_world

        generate_world(args.seed)
        return 0
    if args.command == "validate":
        from attrib.validation.run import run_validation

        run_validation(args.seed)
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(main())
