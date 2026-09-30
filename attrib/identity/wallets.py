"""Wallet types and address helpers. Phase 4."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class WalletAddress:
    """A chain address with checksum validity."""

    chain: str
    value: str
    valid: bool
