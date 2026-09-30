"""Health and not-yet-implemented route handlers."""

from __future__ import annotations

from fastapi import APIRouter

from attrib.api.schemas import HealthResponse
from attrib.config.settings import get_settings

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Liveness. No auth."""

    return HealthResponse(status="ok", disclosure=get_settings().disclosure)
