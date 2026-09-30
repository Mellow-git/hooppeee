"""Chain data provider interface (D14). Fixture default; Esplora is stretch."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class ChainProvider(ABC):
    """Public chain data. No scanning of hosts."""

    @abstractmethod
    def transactions(self) -> list[dict[str, Any]]:
        """Return transactions for clustering."""


class FixtureChainProvider(ChainProvider):
    """Reads fixtures/chain. Phase 4."""

    def transactions(self) -> list[dict[str, Any]]:
        """Phase 4."""

        raise NotImplementedError("FixtureChainProvider.transactions is implemented in Phase 4")


class EsploraProvider(ChainProvider):
    """Optional Esplora HTTP API. Stretch, after all gates."""

    def transactions(self) -> list[dict[str, Any]]:
        """Stretch."""

        raise NotImplementedError("EsploraProvider is stretch after Phases 0–8")
