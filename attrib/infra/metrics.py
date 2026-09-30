"""Scan-cycle metrics and false-lead estimate (D22). Phase 3."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


@dataclass(frozen=True)
class FalseLeadEstimate:
    """Never invent a rate. None means not yet measured."""

    estimate: float | None
    status: Literal["measured", "not_yet_measured"]
    comparisons: int
    confirmed: int
    logged_only: int


def false_lead_estimate(comparisons: int, confirmed: int, logged_only: int) -> FalseLeadEstimate:
    """expected_false_leads = comparisons * per_comparison_fp_rate from local_validation only."""

    raise NotImplementedError("false_lead_estimate is implemented in Phase 3")
