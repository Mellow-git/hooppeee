"""Application settings loaded from environment and thresholds.yaml."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal

import yaml
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

PACKAGE_DIR = Path(__file__).resolve().parent
ATTRIB_DIR = PACKAGE_DIR.parent
REPO_ROOT = ATTRIB_DIR.parent
THRESHOLDS_PATH = PACKAGE_DIR / "thresholds.yaml"
DISCLOSURE_PATH = PACKAGE_DIR / "disclosure.txt"
ASN_EXCLUSIONS_PATH = PACKAGE_DIR / "asn_exclusions.csv"
FUNCTION_WORDS_PATH = PACKAGE_DIR / "function_words_en.txt"


class CadenceConfig(BaseModel):
    """Fetch intervals by source reliability tier."""

    tier_a_hours_min: int
    tier_a_hours_max: int
    tier_b_hours: int
    tier_c_hours_min: int
    tier_c_hours_max: int


class CollectorConfig(BaseModel):
    """Collector timeouts, retries, body cap, Tor proxy."""

    timeout_seconds_min: int
    timeout_seconds_max: int
    max_attempts: int
    max_body_bytes: int
    parse_time_cap_seconds: int
    tor_proxy_url: str


class InfraConfig(BaseModel):
    """Infrastructure gate cutoffs."""

    prevalence_max: int
    exclusion_stale_days: int
    exclusion_refresh_days: int


class IdentityConfig(BaseModel):
    """Wallet clustering caps and CoinJoin heuristics."""

    cluster_max: int
    coinjoin_min_inputs: int
    coinjoin_min_equal_value_outputs: int


class PersonaConfig(BaseModel):
    """Stylometry and obfuscation gates. Several fields are PLACEHOLDER."""

    min_corpus_words: int
    agg_window_days: int
    min_reference_set_size: int
    mixed_script_token_ratio_threshold: float
    confusable_substitution_rate_threshold: float
    entropy_flattening_zscore_threshold: float
    style_shift_delta_threshold: float
    ngram_min: int
    ngram_max: int


class LedgerConfig(BaseModel):
    """Contradiction generator windows."""

    concurrency_seconds: int


class ApiConfig(BaseModel):
    """HTTP pagination and rate limits."""

    rate_limit_per_minute: int
    page_size_default: int
    page_size_max: int


class AuthConfig(BaseModel):
    """API key material size."""

    api_key_bytes: int


class Thresholds(BaseModel):
    """All operational thresholds. No magic numbers in engine code."""

    cadence: CadenceConfig
    collector: CollectorConfig
    infra: InfraConfig
    identity: IdentityConfig
    persona: PersonaConfig
    ledger: LedgerConfig
    api: ApiConfig
    auth: AuthConfig


def load_thresholds(path: Path = THRESHOLDS_PATH) -> Thresholds:
    """Load and validate thresholds.yaml."""

    with path.open(encoding="utf-8") as handle:
        raw: object = yaml.safe_load(handle)
    if not isinstance(raw, dict):
        msg = "thresholds.yaml must be a mapping"
        raise TypeError(msg)
    return Thresholds.model_validate(raw)


def load_disclosure(path: Path = DISCLOSURE_PATH) -> str:
    """Disclosure text required on every API response, export, and UI view."""

    return path.read_text(encoding="utf-8").strip()


class Settings(BaseSettings):
    """Process environment. MOCK is the default run mode."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    run_mode: Literal["MOCK", "LIVE"] = "MOCK"
    enable_live: bool = False
    enable_embeddings: bool = False
    enable_playwright_collector: bool = False
    watchlist_path: Path | None = None

    postgres_dsn: str = "postgresql+psycopg://attrib:attrib@localhost:5432/attrib"
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_user: str = "neo4j"
    neo4j_password: str = "attribdevpassword"
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "attrib"
    minio_secret_key: str = "attribsecret"
    minio_bucket: str = "raw-records"
    minio_secure: bool = False

    mock_market_base_url: str = "http://localhost:8088"
    redis_url: str | None = None

    api_host: str = "0.0.0.0"
    api_port: int = 8000
    worker_role: Literal["default", "tierc"] = "default"

    log_level: str = "INFO"

    thresholds: Thresholds = Field(default_factory=load_thresholds)

    @property
    def disclosure(self) -> str:
        """Cached disclosure string from config/disclosure.txt."""

        return load_disclosure()

    @property
    def live_enabled(self) -> bool:
        """LIVE requires both the mode flag and ENABLE_LIVE=1."""

        return self.run_mode == "LIVE" and self.enable_live


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Process-wide settings singleton."""

    return Settings()
