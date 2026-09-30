"""Named validation scenarios. Phase 8."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Scenario:
    """A labelled synthetic scenario."""

    name: str
    description: str


def all_scenarios() -> list[Scenario]:
    """Phase 8."""

    raise NotImplementedError("all_scenarios is implemented in Phase 8")
