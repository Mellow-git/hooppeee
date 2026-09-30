"""Obfuscation indicator gate (D9). Phase 5."""

from __future__ import annotations

from typing import Literal

ObfuscationResult = Literal[
    "no_indicators_detected",
    "withheld",
    "insufficient_data",
    "insufficient_reference_set",
]


def detect_obfuscation_indicators(text: str, author_history: list[str]) -> list[str]:
    """Return triggered indicator names. Any indicator means withheld. Phase 5."""

    raise NotImplementedError("detect_obfuscation_indicators is implemented in Phase 5")
