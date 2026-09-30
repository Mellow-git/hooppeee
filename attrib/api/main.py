"""FastAPI application. REST only (D11)."""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

from attrib.api.routes.actors import router as actors_router
from attrib.api.routes.health import router as health_router
from attrib.api.routes.misc import router as misc_router
from attrib.api.schemas import ErrorBody
from attrib.config.settings import get_settings

logger = logging.getLogger("attrib.api")


def _limiter() -> Limiter:
    settings = get_settings()
    return Limiter(
        key_func=get_remote_address,
        default_limits=[f"{settings.thresholds.api.rate_limit_per_minute}/minute"],
    )


limiter = _limiter()


class AuditPlaceholderMiddleware(BaseHTTPMiddleware):
    """Audit rows are persisted in Phase 6. Request still flows in Phase 0."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        return await call_next(request)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Warn on LIVE startup."""

    settings = get_settings()
    logging.basicConfig(level=settings.log_level)
    if settings.live_enabled:
        logger.warning(
            "LIVE mode: ENABLE_LIVE=1. Collection must use Tor (socks5h). "
            "This is not a targeting or exploitation tool."
        )
    elif settings.run_mode == "LIVE" and not settings.enable_live:
        logger.warning("RUN_MODE=LIVE but ENABLE_LIVE is not set; refusing live collection.")
    yield


def create_app() -> FastAPI:
    """Application factory."""

    settings = get_settings()
    app = FastAPI(title="attrib", version="0.1.0", lifespan=lifespan)
    app.state.limiter = limiter
    app.add_middleware(AuditPlaceholderMiddleware)
    app.include_router(health_router)
    app.include_router(actors_router)
    app.include_router(misc_router)

    @app.exception_handler(NotImplementedError)
    async def not_implemented_handler(_request: Request, exc: NotImplementedError) -> JSONResponse:
        body = ErrorBody(detail=str(exc), disclosure=settings.disclosure)
        return JSONResponse(status_code=501, content=body.model_dump())

    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(_request: Request, _exc: RateLimitExceeded) -> JSONResponse:
        body = ErrorBody(detail="rate limit exceeded", disclosure=settings.disclosure)
        return JSONResponse(status_code=429, content=body.model_dump())

    return app


app = create_app()
