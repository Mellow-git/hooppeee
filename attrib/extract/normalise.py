"""Identifier normalisers. Each returns raw, normalised, valid. Phase 2."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class NormaliseResult:
    """Raw value, normalised value, and validity flag."""

    raw: str
    normalised: str
    valid: bool
    skeleton: str | None = None


def normalise_pgp_fingerprint(value: str) -> NormaliseResult:
    """Strip whitespace, upper-case; 40 hex (v4) or 64 hex (v5). Phase 2."""

    raise NotImplementedError("normalise_pgp_fingerprint is implemented in Phase 2")


def normalise_btc(value: str) -> NormaliseResult:
    """Base58Check, Bech32, Bech32m. Invalid checksums are not silently dropped. Phase 2."""

    raise NotImplementedError("normalise_btc is implemented in Phase 2")


def normalise_eth(value: str) -> NormaliseResult:
    """EIP-55 mixed-case checksum via keccak256. Phase 2."""

    raise NotImplementedError("normalise_eth is implemented in Phase 2")


def normalise_handle(value: str) -> NormaliseResult:
    """NFKC + casefold, then TR39 confusable skeleton (D8). Phase 2."""

    raise NotImplementedError("normalise_handle is implemented in Phase 2")


def normalise_contact_id(value: str) -> NormaliseResult:
    """Lower-case, strip tags and whitespace. Phase 2."""

    raise NotImplementedError("normalise_contact_id is implemented in Phase 2")
