"""Phase 0: docs, config, and invariant tests that must pass now."""

from __future__ import annotations

from attrib.config.settings import REPO_ROOT, load_disclosure, load_thresholds
from attrib.ledger.band import Band, band, corroboration
from attrib.ledger.models import LedgerRow

DECISIONS = (REPO_ROOT / "docs" / "DECISIONS.md").read_text(encoding="utf-8")


def test_decisions_contains_section_2_rows() -> None:
    """DECISIONS.md must contain every D1–D23 row."""

    for i in range(1, 24):
        assert f"D{i}\t" in DECISIONS


def test_compose_data_service_memory_limits() -> None:
    compose = (REPO_ROOT / "docker-compose.yml").read_text(encoding="utf-8")
    assert "mem_limit: 2g" in compose
    assert "NEO4J_server_memory_heap_max__size: 1g" in compose
    assert "mem_limit: 512m" in compose
    assert "mem_limit: 256m" in compose


def test_xfail_tests_are_strict_and_phased() -> None:
    import re

    text = (REPO_ROOT / "tests" / "unit" / "test_unimplemented_xfail.py").read_text(
        encoding="utf-8"
    )
    reasons = re.findall(r'reason="(Phase \d+: [^"]+)"', text)
    assert text.count("strict=True") == 22
    assert len(reasons) == 22
    assert all(item.startswith("Phase ") for item in reasons)


def test_todo_verify_exists() -> None:
    text = (REPO_ROOT / "docs" / "TODO_VERIFY.md").read_text(encoding="utf-8")
    assert "wallet_cio" in text
    assert "F1=0.27" in text


def test_disclosure_text() -> None:
    text = load_disclosure()
    assert "Investigative lead only" in text
    assert "not probabilities" in text.lower() or "they are not probabilities" in text


def test_thresholds_load() -> None:
    t = load_thresholds()
    assert t.infra.prevalence_max == 5
    assert t.identity.cluster_max == 500
    assert t.persona.min_reference_set_size == 20
    assert t.collector.tor_proxy_url.startswith("socks5h://")
    assert t.collector.max_body_bytes == 10 * 1024 * 1024


def test_compose_collector_net_is_internal() -> None:
    compose = (REPO_ROOT / "docker-compose.yml").read_text(encoding="utf-8")
    assert "collector_net:" in compose
    assert "internal: true" in compose
    assert "socks5h://" in (REPO_ROOT / "attrib" / "config" / "thresholds.yaml").read_text(
        encoding="utf-8"
    )


def test_tor_proxy_url_is_socks5h() -> None:
    from attrib.collector.tor_fetcher import tor_proxy_url

    url = tor_proxy_url()
    assert url.startswith("socks5h://")
    assert "socks5://" not in url.replace("socks5h://", "")


def test_tierc_worker_disables_js_rendering_in_compose() -> None:
    compose = (REPO_ROOT / "docker-compose.yml").read_text(encoding="utf-8")
    assert 'ENABLE_PLAYWRIGHT_COLLECTOR: "0"' in compose
    assert "WORKER_ROLE: tierc" in compose


def test_function_words_present() -> None:
    path = REPO_ROOT / "attrib" / "config" / "function_words_en.txt"
    words = [line.strip() for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
    assert len(words) >= 150


def _row(
    *,
    tier: int,
    polarity: str,
    independence_class: str,
) -> LedgerRow:
    from datetime import UTC, datetime
    from uuid import uuid4

    return LedgerRow(
        entry_id=uuid4(),
        subject_type="actor_pair",
        subject_id=uuid4(),
        evidence_type="test",
        tier=tier,  # type: ignore[arg-type]
        polarity=polarity,  # type: ignore[arg-type]
        independence_class=independence_class,
        source_id=None,
        error_rate_ref_id=None,
        raw_value={},
        created_at=datetime.now(UTC),
    )


def test_band_none_without_support() -> None:
    assert band([]) is Band.NONE
    assert band([_row(tier=2, polarity="contradicting", independence_class="pgp")]) is Band.NONE


def test_band_strongest_supporting_tier() -> None:
    rows = [
        _row(tier=3, polarity="supporting", independence_class="stylometry"),
        _row(tier=1, polarity="supporting", independence_class="tls"),
    ]
    assert band(rows) is Band.HIGH


def test_band_contested_when_contradiction_le_top() -> None:
    rows = [
        _row(tier=2, polarity="supporting", independence_class="wallet"),
        _row(tier=2, polarity="contradicting", independence_class="pgp"),
    ]
    assert band(rows) is Band.CONTESTED


def test_band_not_contested_when_contradiction_weaker() -> None:
    rows = [
        _row(tier=1, polarity="supporting", independence_class="tls"),
        _row(tier=3, polarity="contradicting", independence_class="behaviour"),
    ]
    assert band(rows) is Band.HIGH


def test_stylometry_alone_is_exploratory() -> None:
    rows = [_row(tier=3, polarity="supporting", independence_class="stylometry")]
    assert band(rows) is Band.EXPLORATORY


def test_corroboration_counts_distinct_classes() -> None:
    rows = [
        _row(tier=1, polarity="supporting", independence_class="tls"),
        _row(tier=1, polarity="supporting", independence_class="webapp_stack"),
        _row(tier=2, polarity="contradicting", independence_class="handle"),
    ]
    assert corroboration(rows) == 2
    assert band(rows) is Band.HIGH


def test_no_weighted_sum_in_ledger_package() -> None:
    ledger_dir = REPO_ROOT / "attrib" / "ledger"
    blob = ""
    for path in ledger_dir.glob("*.py"):
        blob += path.read_text(encoding="utf-8")
    assert "weighted" not in blob.lower()
    assert "bayesian" not in blob.lower()
    assert "fused_score" not in blob


def test_error_rates_seed_wallet_cio() -> None:
    import yaml

    raw = yaml.safe_load(
        (REPO_ROOT / "fixtures" / "error_rates_seed.yaml").read_text(encoding="utf-8")
    )
    wallet = next(item for item in raw if item["method"] == "wallet_cio")
    assert wallet["precision_val"] == 0.36
    assert wallet["recall_val"] == 0.44
    assert wallet["placeholder"] is True
    assert wallet["verified"] is False
    assert "f1" not in wallet
