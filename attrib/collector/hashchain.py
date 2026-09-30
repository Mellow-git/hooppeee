"""Raw-record hash chain (D17). Implemented in Phase 1."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

GENESIS_PREV = "0" * 64


def compute_chain_hash(
    prev_chain_hash: str,
    content_sha256: str,
    captured_at: datetime,
    source_id: UUID,
) -> str:
    """sha256(prev_chain_hash || content_sha256 || captured_at_iso || source_id). Phase 1."""

    raise NotImplementedError("compute_chain_hash is implemented in Phase 1")


def verify_chain() -> bool:
    """Return False if any record is tampered, deleted, or reordered. Phase 1."""

    raise NotImplementedError("verify_chain is implemented in Phase 1")
