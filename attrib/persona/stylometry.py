"""Stylometry rank/margin/N. Never a percentile (D10). Phase 5."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class StylometryResult:
    """Rank, margin to runner-up, and reference-set size. No percentile field."""

    rank: int
    margin: float
    reference_set_size: int
    obfuscation_check_result: str


def run_stylometry(candidate_text: str, references: dict[str, str]) -> StylometryResult:
    """Refuse below MIN_CORPUS_WORDS or N < 20. Phase 5."""

    raise NotImplementedError("run_stylometry is implemented in Phase 5")
