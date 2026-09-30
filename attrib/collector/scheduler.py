"""APScheduler worker jobs. Cadence from config. Implemented in Phase 1."""

from __future__ import annotations

from apscheduler.schedulers.blocking import BlockingScheduler

from attrib.config.settings import get_settings


def build_scheduler() -> BlockingScheduler:
    """Construct a scheduler. Jobs are registered in Phase 1."""

    return BlockingScheduler()


def _heartbeat() -> None:
    """Keep the scheduler non-empty. Does not fetch."""

    return None


def run_worker() -> None:
    """Start the worker process. Fetch jobs land in Phase 1."""

    settings = get_settings()
    if settings.live_enabled:
        import logging

        logging.getLogger("attrib.worker").warning(
            "LIVE mode enabled. Collection must use Tor only. ENABLE_LIVE=1."
        )
    scheduler = build_scheduler()
    scheduler.add_job(_heartbeat, "interval", hours=1, id="heartbeat")
    scheduler.start()


def schedule_sources() -> None:
    """Register per-source cadence jobs. Phase 1."""

    raise NotImplementedError("schedule_sources is implemented in Phase 1")
