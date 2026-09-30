"""Band and corroboration (D1, D2). Implemented exactly as specified."""

from __future__ import annotations

from enum import StrEnum

from attrib.ledger.models import LedgerRow


class Band(StrEnum):
    """Confidence band. Not a probability. Not a fused scalar."""

    HIGH = "high"
    MODERATE = "moderate"
    EXPLORATORY = "exploratory"
    CONTESTED = "contested"
    NONE = "none"


def band(rows: list[LedgerRow]) -> Band:
    """Strongest supporting tier; contested if equal-or-stronger contradiction exists."""

    sup = [r for r in rows if r.polarity == "supporting"]
    con = [r for r in rows if r.polarity == "contradicting"]
    if not sup:
        return Band.NONE
    top = min(r.tier for r in sup)  # tier 1 is strongest
    if any(c.tier <= top for c in con):
        return Band.CONTESTED
    return {1: Band.HIGH, 2: Band.MODERATE, 3: Band.EXPLORATORY}[top]


def corroboration(rows: list[LedgerRow]) -> int:
    """Count of distinct supporting independence classes. Never merged into the band."""

    return len({r.independence_class for r in rows if r.polarity == "supporting"})
