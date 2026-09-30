"""Tor-backed fetcher. LIVE only. DNS via socks5h (D20). Full fetch in stretch/Phase 1."""

from __future__ import annotations

from uuid import UUID

from attrib.collector.base import FetchResult, SourceFetcher
from attrib.config.settings import get_settings


def tor_proxy_url() -> str:
    """Proxy URL used for Tor fetches. Must be socks5h:// so DNS stays inside Tor."""

    return get_settings().thresholds.collector.tor_proxy_url


class TorFetcher(SourceFetcher):
    """httpx client with socks5h://tor:9050. Fetch body is Phase 1 / stretch LIVE."""

    def fetch(self, source_id: UUID, url_or_onion: str) -> FetchResult:
        """LIVE GET through Tor. Not implemented in Phase 0."""

        raise NotImplementedError("TorFetcher.fetch is implemented in Phase 1 / stretch LIVE")
