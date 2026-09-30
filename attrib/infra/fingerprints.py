"""Fingerprint extraction and independence classes. Phase 3."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

IndependenceClass = Literal["tls", "webapp_stack", "custom_asset", "ssh"]


@dataclass(frozen=True)
class Fingerprint:
    """One fingerprint value tagged with its independence class."""

    family: str
    value: str
    independence_class: IndependenceClass


def extract_fingerprints(headers: dict[str, str], body: bytes) -> list[Fingerprint]:
    """Derive tls/webapp_stack/custom_asset/ssh fingerprints. Phase 3."""

    raise NotImplementedError("extract_fingerprints is implemented in Phase 3")
