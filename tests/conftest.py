"""Shared pytest fixtures."""

from __future__ import annotations

from collections.abc import Iterator

import pytest
from attrib.api.main import create_app
from attrib.config.settings import get_settings
from fastapi.testclient import TestClient


@pytest.fixture
def client() -> Iterator[TestClient]:
    """In-process API client."""

    get_settings.cache_clear()
    with TestClient(create_app()) as test_client:
        yield test_client
