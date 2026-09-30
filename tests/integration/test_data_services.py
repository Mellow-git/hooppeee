"""Tests that need Compose data services (postgres, neo4j, minio)."""

from __future__ import annotations

import pytest
from attrib.config.settings import get_settings

pytestmark = pytest.mark.integration


def test_postgres_neo4j_minio_reachable() -> None:
    """Each data service accepts a connection on the published host port."""

    import httpx
    import psycopg
    from neo4j import GraphDatabase

    settings = get_settings()
    with (
        psycopg.connect(
            "host=127.0.0.1 port=5432 dbname=attrib user=attrib password=attrib",
            connect_timeout=5,
        ) as conn,
        conn.cursor() as cur,
    ):
        cur.execute("SELECT 1")
        row = cur.fetchone()
    assert row == (1,)

    driver = GraphDatabase.driver(
        "bolt://127.0.0.1:7687",
        auth=(settings.neo4j_user, settings.neo4j_password),
    )
    try:
        driver.verify_connectivity()
        with driver.session() as session:
            value = session.run("RETURN 1 AS n").single()
        assert value is not None
        assert int(value["n"]) == 1
    finally:
        driver.close()

    response = httpx.get("http://127.0.0.1:9000/minio/health/live", timeout=5.0)
    assert response.status_code == 200
