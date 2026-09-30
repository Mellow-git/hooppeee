"""PostgreSQL ORM models matching the Phase 1 schema."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Computed,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    SmallInteger,
    String,
    Text,
    Uuid,
    func,
)
from sqlalchemy.dialects.postgresql import INET, JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Declarative base."""


class Source(Base):
    """Watchlisted public source."""

    __tablename__ = "source"
    __table_args__ = (
        CheckConstraint("reliability_tier IN ('A','B','C','D')", name="source_tier_chk"),
    )

    source_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    url_or_onion: Mapped[str] = mapped_column(Text, nullable=False)
    reliability_tier: Mapped[str] = mapped_column(String(1), nullable=False)
    cadence_hours: Mapped[int] = mapped_column(Integer, nullable=False)
    last_scan_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(Text, nullable=False, default="active")


class RawRecord(Base):
    """Fetched body metadata and hash-chain link."""

    __tablename__ = "raw_record"

    record_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    source_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("source.source_id"), nullable=False
    )
    captured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    content_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    prev_chain_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    chain_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    object_key: Mapped[str] = mapped_column(Text, nullable=False)
    http_status: Mapped[int | None] = mapped_column(Integer, nullable=True)


class ErrorRateReference(Base):
    """Literature prior. F1 is generated; never written (D4)."""

    __tablename__ = "error_rate_reference"

    ref_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    method: Mapped[str] = mapped_column(Text, nullable=False)
    chain: Mapped[str | None] = mapped_column(Text, nullable=True)
    precision_val: Mapped[Any] = mapped_column(Numeric(5, 4), nullable=False)
    recall_val: Mapped[Any] = mapped_column(Numeric(5, 4), nullable=False)
    f1: Mapped[Any] = mapped_column(
        Numeric(5, 4),
        Computed(
            "CASE WHEN precision_val + recall_val = 0 THEN 0 "
            "ELSE 2 * precision_val * recall_val / (precision_val + recall_val) END",
            persisted=True,
        ),
    )
    dataset_desc: Mapped[str] = mapped_column(Text, nullable=False)
    citation: Mapped[str] = mapped_column(Text, nullable=False)
    verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    placeholder: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class LocalValidation(Base):
    """Locally measured rates from the validation harness."""

    __tablename__ = "local_validation"

    run_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    method: Mapped[str] = mapped_column(Text, nullable=False)
    precision_val: Mapped[Any | None] = mapped_column(Numeric(5, 4), nullable=True)
    recall_val: Mapped[Any | None] = mapped_column(Numeric(5, 4), nullable=True)
    n_cases: Mapped[int] = mapped_column(Integer, nullable=False)
    per_comparison_fp_rate: Mapped[Any | None] = mapped_column(Numeric(12, 10), nullable=True)
    run_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    seed: Mapped[int] = mapped_column(Integer, nullable=False)


class LedgerEntry(Base):
    """One evidence item. No fused score."""

    __tablename__ = "ledger_entry"
    __table_args__ = (
        CheckConstraint("subject_type IN ('actor_pair','actor_infra')", name="ledger_subject_chk"),
        CheckConstraint("tier IN (1,2,3)", name="ledger_tier_chk"),
        CheckConstraint("polarity IN ('supporting','contradicting')", name="ledger_polarity_chk"),
    )

    entry_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    subject_type: Mapped[str] = mapped_column(Text, nullable=False)
    subject_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    evidence_type: Mapped[str] = mapped_column(Text, nullable=False)
    tier: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    polarity: Mapped[str] = mapped_column(Text, nullable=False)
    independence_class: Mapped[str] = mapped_column(Text, nullable=False)
    source_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("source.source_id"), nullable=True
    )
    error_rate_ref_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid, ForeignKey("error_rate_reference.ref_id"), nullable=True
    )
    raw_value: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class ApiKey(Base):
    """API key: store SHA-256 only."""

    __tablename__ = "api_key"
    __table_args__ = (
        CheckConstraint("role IN ('analyst','auditor','admin')", name="api_key_role_chk"),
    )

    key_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    key_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    role: Mapped[str] = mapped_column(Text, nullable=False)
    label: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    revoked: Mapped[bool | None] = mapped_column(Boolean, default=False)


class AuditEvent(Base):
    """One row per API request."""

    __tablename__ = "audit_event"

    event_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    key_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, nullable=True)
    method: Mapped[str | None] = mapped_column(Text, nullable=True)
    path: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[int | None] = mapped_column(Integer, nullable=True)
    at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), server_default=func.now())


class InfraAudit(Base):
    """Single-class and discarded infra matches. Never ledger."""

    __tablename__ = "infra_audit"

    audit_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    onion_record_id: Mapped[uuid.UUID | None] = mapped_column(Uuid, nullable=True)
    candidate_ip: Mapped[str | None] = mapped_column(INET, nullable=True)
    families: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    classes: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    discarded_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ScanMetrics(Base):
    """Per-cycle comparison counts."""

    __tablename__ = "scan_metrics"

    cycle_id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    comparisons: Mapped[int] = mapped_column(Integer, nullable=False)
    confirmed: Mapped[int] = mapped_column(Integer, nullable=False)
    logged_only: Mapped[int] = mapped_column(Integer, nullable=False)
    at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), server_default=func.now())
