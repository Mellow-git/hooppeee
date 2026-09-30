"""Behavioural Tier 3 signals. Phase 5."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class BehaviourResult:
    """Posting-time JS divergence and listing-template Jaccard."""

    posting_time_jsd: float
    template_jaccard: float


def compare_behaviour() -> BehaviourResult:
    """Phase 5."""

    raise NotImplementedError("compare_behaviour is implemented in Phase 5")
