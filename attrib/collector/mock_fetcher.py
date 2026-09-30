"""Offline fetcher: fixtures or mock-market container. Implemented in Phase 1."""

from __future__ import annotations

from uuid import UUID

from attrib.collector.base import FetchResult, SourceFetcher


class MockFetcher(SourceFetcher):
    """Reads fixtures/mock_market or hits the mock-market container."""

    def fetch(self, source_id: UUID, url_or_onion: str) -> FetchResult:
        """Phase 1: read seeded HTML. Not implemented in Phase 0."""

        raise NotImplementedError("MockFetcher.fetch is implemented in Phase 1")
