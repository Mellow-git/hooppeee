"""Source fetcher interface and result types."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime
from uuid import UUID


@dataclass(frozen=True)
class FetchResult:
    """Outcome of a single fetch of a watchlisted public page."""

    source_id: UUID
    captured_at: datetime
    body: bytes
    http_status: int
    content_sha256: str
    unreachable: bool = False


class SourceFetcher(ABC):
    """Fetch publicly reachable pages of watchlisted sources only."""

    @abstractmethod
    def fetch(self, source_id: UUID, url_or_onion: str) -> FetchResult:
        """GET a watchlisted page. Must not probe, login, or render hostile JS for Tier C."""
