"""CoinJoin-like transaction exclusion (D6). Phase 4."""

from __future__ import annotations

from typing import Any


def is_coinjoin_like(tx: dict[str, Any]) -> bool:
    """True if >=3 inputs and >=3 equal-value outputs, or mixer address. Phase 4."""

    raise NotImplementedError("is_coinjoin_like is implemented in Phase 4")
