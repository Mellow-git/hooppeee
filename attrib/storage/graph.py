"""Neo4j driver helpers. Constraints and writes in Phase 4."""

from __future__ import annotations

from neo4j import Driver, GraphDatabase

from attrib.config.settings import get_settings


def get_driver() -> Driver:
    """Bolt driver."""

    settings = get_settings()
    return GraphDatabase.driver(
        settings.neo4j_uri,
        auth=(settings.neo4j_user, settings.neo4j_password),
    )


def ensure_constraints() -> None:
    """Unique constraints on Actor, Identifier, Source, InfraIndicator. Phase 4."""

    raise NotImplementedError("ensure_constraints is implemented in Phase 4")
