"""Unimplemented behaviour raises NotImplementedError (xfail until the named phase)."""

from __future__ import annotations

from uuid import uuid4

import pytest
from attrib.collector.hashchain import compute_chain_hash, verify_chain
from attrib.collector.mock_fetcher import MockFetcher
from attrib.collector.scheduler import schedule_sources
from attrib.collector.tor_fetcher import TorFetcher
from attrib.extract.normalise import (
    normalise_btc,
    normalise_eth,
    normalise_handle,
    normalise_pgp_fingerprint,
)
from attrib.extract.parsers import parse_forum_post, parse_listing
from attrib.identity.chain_providers import FixtureChainProvider
from attrib.identity.clustering import cluster_wallets
from attrib.identity.coinjoin import is_coinjoin_like
from attrib.infra.gate import run_gate
from attrib.infra.metrics import false_lead_estimate
from attrib.ledger.contradictions import concurrent_posting, handle_pgp_mismatch
from attrib.persona.obfuscation import detect_obfuscation_indicators
from attrib.persona.stylometry import run_stylometry
from attrib.validation.run import run_validation
from attrib.validation.world import generate_world


@pytest.mark.xfail(strict=True, raises=NotImplementedError, reason="Phase 1: MockFetcher.fetch")
def test_xfail_mock_fetcher_fetch() -> None:
    MockFetcher().fetch(uuid4(), "http://mock-market/index.html")


@pytest.mark.xfail(strict=True, raises=NotImplementedError, reason="Phase 1: TorFetcher.fetch")
def test_xfail_tor_fetcher_fetch() -> None:
    TorFetcher().fetch(uuid4(), "http://exampleinvalid.onion/")


@pytest.mark.xfail(strict=True, raises=NotImplementedError, reason="Phase 1: hash chain")
def test_xfail_compute_chain_hash() -> None:
    from datetime import UTC, datetime

    compute_chain_hash("0" * 64, "a" * 64, datetime.now(UTC), uuid4())


@pytest.mark.xfail(strict=True, raises=NotImplementedError, reason="Phase 1: verify_chain")
def test_xfail_verify_chain() -> None:
    verify_chain()


@pytest.mark.xfail(strict=True, raises=NotImplementedError, reason="Phase 1: schedule_sources")
def test_xfail_schedule_sources() -> None:
    schedule_sources()


@pytest.mark.xfail(strict=True, raises=NotImplementedError, reason="Phase 2: parse_listing")
def test_xfail_parse_listing() -> None:
    parse_listing("<html></html>")


@pytest.mark.xfail(strict=True, raises=NotImplementedError, reason="Phase 2: parse_forum_post")
def test_xfail_parse_forum_post() -> None:
    parse_forum_post("<html></html>")


@pytest.mark.xfail(
    strict=True, raises=NotImplementedError, reason="Phase 2: normalise_pgp_fingerprint"
)
def test_xfail_normalise_pgp() -> None:
    normalise_pgp_fingerprint("aa")


@pytest.mark.xfail(strict=True, raises=NotImplementedError, reason="Phase 2: normalise_btc")
def test_xfail_normalise_btc() -> None:
    normalise_btc("1invalid")


@pytest.mark.xfail(strict=True, raises=NotImplementedError, reason="Phase 2: normalise_eth")
def test_xfail_normalise_eth() -> None:
    normalise_eth("0x00")


@pytest.mark.xfail(strict=True, raises=NotImplementedError, reason="Phase 2: normalise_handle")
def test_xfail_normalise_handle() -> None:
    normalise_handle("Handle")


@pytest.mark.xfail(strict=True, raises=NotImplementedError, reason="Phase 3: infra gate")
def test_xfail_run_gate() -> None:
    run_gate(uuid4(), [])


@pytest.mark.xfail(strict=True, raises=NotImplementedError, reason="Phase 3: false-lead estimate")
def test_xfail_false_lead_estimate() -> None:
    false_lead_estimate(0, 0, 0)


@pytest.mark.xfail(strict=True, raises=NotImplementedError, reason="Phase 4: is_coinjoin_like")
def test_xfail_coinjoin() -> None:
    is_coinjoin_like({"inputs": [], "outputs": []})


@pytest.mark.xfail(strict=True, raises=NotImplementedError, reason="Phase 4: cluster_wallets")
def test_xfail_cluster_wallets() -> None:
    cluster_wallets()


@pytest.mark.xfail(strict=True, raises=NotImplementedError, reason="Phase 4: FixtureChainProvider")
def test_xfail_fixture_chain() -> None:
    FixtureChainProvider().transactions()


@pytest.mark.xfail(
    strict=True, raises=NotImplementedError, reason="Phase 5: obfuscation indicators"
)
def test_xfail_obfuscation() -> None:
    detect_obfuscation_indicators("text", [])


@pytest.mark.xfail(strict=True, raises=NotImplementedError, reason="Phase 5: stylometry")
def test_xfail_stylometry() -> None:
    run_stylometry("text", {})


@pytest.mark.xfail(strict=True, raises=NotImplementedError, reason="Phase 6: handle_pgp_mismatch")
def test_xfail_handle_pgp_mismatch() -> None:
    handle_pgp_mismatch()


@pytest.mark.xfail(strict=True, raises=NotImplementedError, reason="Phase 6: concurrent_posting")
def test_xfail_concurrent_posting() -> None:
    concurrent_posting()


@pytest.mark.xfail(strict=True, raises=NotImplementedError, reason="Phase 8: generate_world")
def test_xfail_generate_world() -> None:
    generate_world(1)


@pytest.mark.xfail(strict=True, raises=NotImplementedError, reason="Phase 8: run_validation")
def test_xfail_run_validation() -> None:
    run_validation(1)
