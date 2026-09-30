"""MinIO object storage for raw fetch bodies. Phase 1."""

from __future__ import annotations

from minio import Minio

from attrib.config.settings import get_settings


def get_minio() -> Minio:
    """MinIO client."""

    settings = get_settings()
    return Minio(
        settings.minio_endpoint,
        access_key=settings.minio_access_key,
        secret_key=settings.minio_secret_key,
        secure=settings.minio_secure,
    )


def put_raw_body(object_key: str, body: bytes) -> None:
    """Store a fetch body. Phase 1."""

    raise NotImplementedError("put_raw_body is implemented in Phase 1")
