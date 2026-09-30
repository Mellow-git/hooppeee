"""SQLAlchemy engine and session factory. Wired in Phase 1."""

from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from attrib.config.settings import get_settings


def get_engine() -> Engine:
    """Create the PostgreSQL engine."""

    settings = get_settings()
    return create_engine(settings.postgres_dsn, future=True)


def session_factory(engine: Engine | None = None) -> sessionmaker[Session]:
    """Session maker bound to the engine."""

    return sessionmaker(bind=engine or get_engine(), expire_on_commit=False, class_=Session)


def get_session() -> Generator[Session, None, None]:
    """FastAPI dependency. Phase 1 persistence."""

    factory = session_factory()
    session = factory()
    try:
        yield session
    finally:
        session.close()
