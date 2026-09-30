"""Contradiction generators. Phase 6."""

from __future__ import annotations

from attrib.ledger.models import LedgerRow


def handle_pgp_mismatch() -> list[LedgerRow]:
    """Same handle on same source, two PGP fingerprints. Phase 6."""

    raise NotImplementedError("handle_pgp_mismatch is implemented in Phase 6")


def concurrent_posting() -> list[LedgerRow]:
    """Hypothesised-one-operator concurrent posts. Phase 6."""

    raise NotImplementedError("concurrent_posting is implemented in Phase 6")
