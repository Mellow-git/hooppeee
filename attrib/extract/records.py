"""Typed extracted records. Phase 2."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Literal
from uuid import UUID

RecordKind = Literal[
    "listing",
    "forum_post",
    "pgp_block",
    "wallet",
    "tls_cert",
    "http_headers",
    "contact_id",
]


@dataclass(frozen=True)
class ExtractedRecord:
    """A typed record produced by extraction."""

    kind: RecordKind
    source_id: UUID
    captured_at: datetime
    payload: dict[str, object]
