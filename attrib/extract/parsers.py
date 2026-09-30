"""HTML parsers. Treat content as hostile. Phase 2."""

from __future__ import annotations

from typing import Any


def parse_listing(html: str) -> dict[str, Any]:
    """Parse a listing page. Phase 2."""

    raise NotImplementedError("parse_listing is implemented in Phase 2")


def parse_forum_post(html: str) -> dict[str, Any]:
    """Parse a forum post. Phase 2."""

    raise NotImplementedError("parse_forum_post is implemented in Phase 2")


def parse_pgp_blocks(html: str) -> list[str]:
    """Extract PGP blocks. Phase 2."""

    raise NotImplementedError("parse_pgp_blocks is implemented in Phase 2")
