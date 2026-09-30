"""Actor routes. Phase 6."""

from __future__ import annotations

from typing import NoReturn
from uuid import UUID

from fastapi import APIRouter

router = APIRouter()


@router.get("/actors/{actor_id}", response_model=None)
def get_actor(actor_id: UUID) -> NoReturn:
    """Analyst+ actor profile. Phase 6."""

    raise NotImplementedError("GET /actors/{id} is implemented in Phase 6")


@router.get("/actors/{actor_id}/ledger", response_model=None)
def get_actor_ledger(actor_id: UUID) -> NoReturn:
    """Analyst+ ledger rows. Phase 6."""

    raise NotImplementedError("GET /actors/{id}/ledger is implemented in Phase 6")


@router.get("/actors/search", response_model=None)
def search_actors() -> NoReturn:
    """Search by handle skeleton, wallet, pgp, onion. Phase 6."""

    raise NotImplementedError("GET /actors/search is implemented in Phase 6")


@router.get("/actors/{actor_id}/timeline", response_model=None)
def actor_timeline(actor_id: UUID) -> NoReturn:
    """Footprint and linkage history. Phase 6."""

    raise NotImplementedError("GET /actors/{id}/timeline is implemented in Phase 6")
