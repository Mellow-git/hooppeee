"""API key auth: SHA-256 lookup, roles. Full enforcement in Phase 6."""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from typing import Literal, NoReturn

from fastapi import Header, Request

Role = Literal["analyst", "auditor", "admin"]

ROLE_ORDER: dict[Role, int] = {"analyst": 1, "auditor": 2, "admin": 3}


def hash_api_key(raw: str) -> str:
    """SHA-256 hex of the presented key. Storage of plaintext is forbidden."""

    import hashlib

    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


async def require_role(
    min_role: Role,
    request: Request,
    x_api_key: str | None = Header(default=None, alias="X-API-Key"),
) -> NoReturn:
    """Role gate. Implemented in Phase 6 against api_key table."""

    raise NotImplementedError(
        f"require_role({min_role}) is implemented in Phase 6 "
        f"(path={request.url.path}, key_present={x_api_key is not None})"
    )


def role_dependency(min_role: Role) -> Callable[..., Awaitable[None]]:
    """FastAPI dependency factory. Phase 6."""

    async def _dep(
        request: Request,
        x_api_key: str | None = Header(default=None, alias="X-API-Key"),
    ) -> None:
        raise NotImplementedError(
            f"require_role({min_role}) is implemented in Phase 6 "
            f"(path={request.url.path}, key_present={x_api_key is not None})"
        )

    return _dep
