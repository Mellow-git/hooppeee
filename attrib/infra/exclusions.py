"""CDN / shared-hosting exclusion list. Fixture in MOCK; RIPEstat in LIVE. Phase 3."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path


@dataclass
class ExclusionList:
    """Loaded ASN/CIDR exclusions with staleness metadata."""

    path: Path
    loaded_at: datetime
    stale: bool


def load_exclusions() -> ExclusionList:
    """Load asn_exclusions.csv. Phase 3."""

    raise NotImplementedError("load_exclusions is implemented in Phase 3")


def refresh_exclusions() -> ExclusionList:
    """Weekly refresh. On failure keep last list and set stale=true. Phase 3."""

    raise NotImplementedError("refresh_exclusions is implemented in Phase 3")


def is_excluded(asn: int | None, ip: str) -> bool:
    """True if ASN or IP range is on the exclusion list. Phase 3."""

    raise NotImplementedError("is_excluded is implemented in Phase 3")
