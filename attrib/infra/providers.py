"""Scan-database provider interface. Fixture default; Censys/Shodan/crt.sh later."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(frozen=True)
class HostHit:
    """A clearnet host sharing a fingerprint value."""

    ip: str
    asn: int | None
    port: int | None


class ScanProvider(ABC):
    """Query third-party scan databases or local fixtures. No live host probing."""

    @abstractmethod
    def hosts_for_value(self, family: str, value: str) -> list[HostHit]:
        """Return clearnet hosts that share this fingerprint value."""


class FixtureScanProvider(ScanProvider):
    """Reads fixtures/scan_provider. Phase 3."""

    def hosts_for_value(self, family: str, value: str) -> list[HostHit]:
        """Phase 3."""

        raise NotImplementedError("FixtureScanProvider.hosts_for_value is implemented in Phase 3")
