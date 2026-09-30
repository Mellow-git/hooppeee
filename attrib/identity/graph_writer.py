"""Write identity graph to Neo4j. Phase 4."""

from __future__ import annotations

from uuid import UUID


def upsert_actor(actor_id: UUID) -> None:
    """Create or update an Actor node. Phase 4."""

    raise NotImplementedError("upsert_actor is implemented in Phase 4")


def link_identifier(actor_id: UUID, identifier_id: UUID, reliability: str) -> None:
    """HAS_IDENTIFIER edge. Phase 4."""

    raise NotImplementedError("link_identifier is implemented in Phase 4")
