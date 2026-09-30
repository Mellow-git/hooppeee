"""Pydantic v2 API schemas. Every response includes disclosure."""

from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class DisclosureModel(BaseModel):
    """Base for every JSON body."""

    disclosure: str


class HealthResponse(DisclosureModel):
    """Liveness."""

    status: str


class Page(DisclosureModel, Generic[T]):
    """Paginated list."""

    items: list[T]
    offset: int
    limit: int
    total: int


class ErrorBody(DisclosureModel):
    """Error payload."""

    detail: str


class ActorSummary(BaseModel):
    """Placeholder actor view used when routes are implemented in Phase 6."""

    actor_id: str
    band: str
    corroboration: int
    known_handles: list[str] = Field(default_factory=list)
