"""Exhaustive band() and corroboration() cases (D1, D2)."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Literal
from uuid import uuid4

from attrib.ledger.band import Band, band, corroboration
from attrib.ledger.models import LedgerRow


def _row(
    *,
    tier: Literal[1, 2, 3],
    polarity: Literal["supporting", "contradicting"],
    independence_class: str,
) -> LedgerRow:
    return LedgerRow(
        entry_id=uuid4(),
        subject_type="actor_pair",
        subject_id=uuid4(),
        evidence_type="test",
        tier=tier,
        polarity=polarity,
        independence_class=independence_class,
        source_id=None,
        error_rate_ref_id=None,
        raw_value={},
        created_at=datetime.now(UTC),
    )


def test_no_supporting_rows_is_none() -> None:
    assert band([]) is Band.NONE


def test_only_contradicting_rows_is_none() -> None:
    rows = [_row(tier=1, polarity="contradicting", independence_class="pgp")]
    assert band(rows) is Band.NONE


def test_top_supporting_tier_1_is_high() -> None:
    rows = [_row(tier=1, polarity="supporting", independence_class="tls")]
    assert band(rows) is Band.HIGH


def test_top_supporting_tier_2_is_moderate() -> None:
    rows = [_row(tier=2, polarity="supporting", independence_class="wallet")]
    assert band(rows) is Band.MODERATE


def test_top_supporting_tier_3_is_exploratory() -> None:
    rows = [_row(tier=3, polarity="supporting", independence_class="stylometry")]
    assert band(rows) is Band.EXPLORATORY


def test_mixed_support_uses_strongest_tier() -> None:
    rows = [
        _row(tier=3, polarity="supporting", independence_class="stylometry"),
        _row(tier=2, polarity="supporting", independence_class="wallet"),
        _row(tier=1, polarity="supporting", independence_class="tls"),
    ]
    assert band(rows) is Band.HIGH


def test_contradiction_equal_to_top_supporting_is_contested() -> None:
    rows = [
        _row(tier=2, polarity="supporting", independence_class="wallet"),
        _row(tier=2, polarity="contradicting", independence_class="pgp"),
    ]
    assert band(rows) is Band.CONTESTED


def test_contradiction_stronger_than_top_supporting_is_contested() -> None:
    rows = [
        _row(tier=3, polarity="supporting", independence_class="stylometry"),
        _row(tier=1, polarity="contradicting", independence_class="pgp"),
    ]
    assert band(rows) is Band.CONTESTED


def test_contradiction_weaker_than_top_supporting_is_not_contested() -> None:
    rows = [
        _row(tier=1, polarity="supporting", independence_class="tls"),
        _row(tier=3, polarity="contradicting", independence_class="behaviour"),
    ]
    assert band(rows) is Band.HIGH


def test_corroboration_counts_distinct_supporting_classes_only() -> None:
    rows = [
        _row(tier=1, polarity="supporting", independence_class="tls"),
        _row(tier=1, polarity="supporting", independence_class="tls"),
        _row(tier=2, polarity="supporting", independence_class="webapp_stack"),
        _row(tier=2, polarity="contradicting", independence_class="handle"),
        _row(tier=1, polarity="contradicting", independence_class="custom_asset"),
    ]
    assert corroboration(rows) == 2


def test_corroboration_zero_without_support() -> None:
    rows = [_row(tier=2, polarity="contradicting", independence_class="pgp")]
    assert corroboration(rows) == 0
