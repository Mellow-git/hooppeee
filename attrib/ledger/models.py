"""Ledger row types used by band computation."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Literal
from uuid import UUID

Polarity = Literal["supporting", "contradicting"]
SubjectType = Literal["actor_pair", "actor_infra"]


@dataclass(frozen=True)
class LedgerRow:
    """One evidence item. No arithmetic combination across rows."""

    entry_id: UUID
    subject_type: SubjectType
    subject_id: UUID
    evidence_type: str
    tier: Literal[1, 2, 3]
    polarity: Polarity
    independence_class: str
    source_id: UUID | None
    error_rate_ref_id: UUID | None
    raw_value: dict[str, object]
    created_at: datetime
