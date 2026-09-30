"""Common-input-ownership clustering with caps. Phase 4."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class WalletCluster:
    """A CIO cluster. Oversized clusters are flagged, not linked."""

    cluster_id: str
    addresses: tuple[str, ...]
    service_wallet_suspected: bool


def cluster_wallets() -> list[WalletCluster]:
    """Cluster after CoinJoin exclusion. Phase 4."""

    raise NotImplementedError("cluster_wallets is implemented in Phase 4")


def run_graph_metrics() -> None:
    """Connected components and betweenness via networkx; write back to Neo4j. Phase 4."""

    raise NotImplementedError("run_graph_metrics is implemented in Phase 4")
