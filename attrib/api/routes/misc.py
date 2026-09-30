"""Remaining REST routes. Phase 6 unless noted."""

from __future__ import annotations

from typing import NoReturn
from uuid import UUID

from fastapi import APIRouter

router = APIRouter()


@router.get("/clusters/{cluster_id}/graph", response_model=None)
def cluster_graph(cluster_id: UUID) -> NoReturn:
    """Cytoscape payload. Phase 6."""

    raise NotImplementedError("GET /clusters/{id}/graph is implemented in Phase 6")


@router.get("/infra/scan-metrics", response_model=None)
def scan_metrics() -> NoReturn:
    """Comparisons and false-lead estimate or not_yet_measured. Phase 3/6."""

    raise NotImplementedError("GET /infra/scan-metrics is implemented in Phase 3")


@router.get("/validation/latest", response_model=None)
def validation_latest() -> NoReturn:
    """Local precision/recall. Phase 8."""

    raise NotImplementedError("GET /validation/latest is implemented in Phase 8")


@router.get("/error-rates", response_model=None)
def error_rates() -> NoReturn:
    """Literature priors with placeholder flags. Phase 6."""

    raise NotImplementedError("GET /error-rates is implemented in Phase 6")


@router.get("/export/{export_id}", response_model=None)
def export_actor(export_id: UUID) -> NoReturn:
    """CSV, JSON, or report. Phase 6."""

    raise NotImplementedError("GET /export/{id} is implemented in Phase 6")


@router.get("/sources", response_model=None)
def list_sources() -> NoReturn:
    """Admin list. Phase 6."""

    raise NotImplementedError("GET /sources is implemented in Phase 6")


@router.post("/sources", response_model=None)
def create_source() -> NoReturn:
    """Admin register. Phase 6."""

    raise NotImplementedError("POST /sources is implemented in Phase 6")


@router.get("/ledger/verify-chain", response_model=None)
def verify_chain_route() -> NoReturn:
    """Auditor+ hash-chain verify. Phase 1/6."""

    raise NotImplementedError("GET /ledger/verify-chain is implemented in Phase 1")


@router.post("/admin/keys", response_model=None)
def create_key() -> NoReturn:
    """Admin create API key; plaintext printed once. Phase 6."""

    raise NotImplementedError("POST /admin/keys is implemented in Phase 6")


@router.delete("/admin/keys/{key_id}", response_model=None)
def revoke_key(key_id: UUID) -> NoReturn:
    """Admin revoke. Phase 6."""

    raise NotImplementedError("DELETE /admin/keys is implemented in Phase 6")
