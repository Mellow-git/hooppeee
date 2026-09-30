"""Jinja2 / WeasyPrint report. Phase 6."""

from __future__ import annotations

from uuid import UUID


def export_report(actor_id: UUID) -> bytes:
    """PDF with disclosure header in templates/base.html.j2. Phase 6."""

    raise NotImplementedError("export_report is implemented in Phase 6")
