"""Infrastructure correlation gate (D3). Phase 3."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal
from uuid import UUID

from attrib.infra.fingerprints import Fingerprint

GateStatus = Literal["multi_signal_confirmed", "single_signal_logged_only", "discarded"]


@dataclass(frozen=True)
class GateResult:
    """Per-candidate outcome of the infra gate."""

    candidate_ip: str
    status: GateStatus
    classes: tuple[str, ...]
    discarded_reason: str | None


def run_gate(onion_record_id: UUID, fingerprints: list[Fingerprint]) -> list[GateResult]:
    """Prevalence, ASN exclusion, then >=2 independence classes to confirm. Phase 3."""

    raise NotImplementedError("run_gate is implemented in Phase 3")
