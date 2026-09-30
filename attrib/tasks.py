"""Cross-platform task runner (D23). Invoked as `python -m attrib.tasks <target>`."""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import time
from collections.abc import Callable, Sequence

import yaml

from attrib.config.settings import REPO_ROOT

DATA_SERVICES: tuple[str, ...] = ("postgres", "neo4j", "minio")
UP_WAIT_SECONDS = 300


def _run(argv: list[str], *, check: bool = True) -> subprocess.CompletedProcess[str]:
    """Run a command from the repo root, streaming output."""

    return subprocess.run(argv, cwd=REPO_ROOT, check=check, text=True)


def _run_capture(argv: list[str]) -> subprocess.CompletedProcess[str]:
    """Run a command and capture stdout/stderr."""

    return subprocess.run(
        argv,
        cwd=REPO_ROOT,
        check=False,
        text=True,
        capture_output=True,
    )


def _ensure_env_file() -> None:
    """Copy .env.example to .env when missing."""

    env_path = REPO_ROOT / ".env"
    example = REPO_ROOT / ".env.example"
    if not env_path.exists() and example.exists():
        env_path.write_text(example.read_text(encoding="utf-8"), encoding="utf-8")


def _docker() -> str:
    """Path to docker CLI, or empty if absent."""

    found = shutil.which("docker")
    return found or ""


def _compose_ps_health(service: str) -> str:
    """Return the Health column for a compose service, or empty."""

    proc = _run_capture(
        [
            "docker",
            "compose",
            "ps",
            "--format",
            "{{.Service}} {{.Health}}",
            service,
        ]
    )
    line = (proc.stdout or "").strip().splitlines()
    if not line:
        return ""
    parts = line[-1].split(maxsplit=1)
    if len(parts) < 2:
        return parts[0] if parts else ""
    return parts[1].strip()


def _wait_data_healthy(timeout_s: int = UP_WAIT_SECONDS) -> None:
    """Block until postgres, neo4j, and minio report healthy."""

    deadline = time.monotonic() + timeout_s
    while time.monotonic() < deadline:
        states = {name: _compose_ps_health(name) for name in DATA_SERVICES}
        if all(state == "healthy" for state in states.values()):
            return
        time.sleep(5)
    states = {name: _compose_ps_health(name) for name in DATA_SERVICES}
    msg = f"data services not healthy within {timeout_s}s: {states}"
    raise SystemExit(msg)


def cmd_up() -> int:
    """Build and start Compose; wait for postgres, neo4j, and minio."""

    _ensure_env_file()
    _run(
        [
            "docker",
            "compose",
            "up",
            "-d",
            "--build",
            "--wait",
            "--wait-timeout",
            str(UP_WAIT_SECONDS),
            *DATA_SERVICES,
        ]
    )
    _wait_data_healthy()
    _run(["docker", "compose", "up", "-d", "--build"])
    return 0


def cmd_down() -> int:
    """Stop Compose services."""

    _run(["docker", "compose", "down"])
    return 0


def cmd_seed() -> int:
    """Regenerate fixtures (Phase 8)."""

    from attrib.validation.world import generate_world

    generate_world(1)
    return 0


def cmd_test() -> int:
    """Run pytest."""

    proc = _run([sys.executable, "-m", "pytest", "tests", "-q", "--tb=short"], check=False)
    return proc.returncode


def cmd_check() -> int:
    """ruff + mypy --strict on attrib/."""

    steps = [
        [sys.executable, "-m", "ruff", "check", "attrib", "tests"],
        [sys.executable, "-m", "ruff", "format", "--check", "attrib", "tests"],
        [sys.executable, "-m", "mypy", "--strict", "attrib"],
    ]
    for argv in steps:
        proc = _run(argv, check=False)
        if proc.returncode != 0:
            return proc.returncode
    return 0


def cmd_validate() -> int:
    """Validation harness (Phase 8)."""

    from attrib.validation.run import run_validation

    run_validation(1)
    return 0


def cmd_e2e() -> int:
    """End-to-end pytest path."""

    proc = _run(
        [sys.executable, "-m", "pytest", "tests/e2e", "-q", "--tb=short"],
        check=False,
    )
    return proc.returncode


def cmd_demo() -> int:
    """Bring the MOCK stack up and print dashboard URLs."""

    cmd_up()
    print("Dashboard: http://localhost:5173")
    print("API health: http://localhost:8000/health")
    try:
        from attrib.validation.world import generate_world

        generate_world(1)
    except NotImplementedError as exc:
        print(f"seed skipped (Phase 8): {exc}")
    return 0


def _free_ram_bytes() -> int | None:
    """Available physical RAM, or None if unknown."""

    if sys.platform == "win32":
        import ctypes

        class MemoryStatusEx(ctypes.Structure):
            _fields_ = [
                ("dwLength", ctypes.c_ulong),
                ("dwMemoryLoad", ctypes.c_ulong),
                ("ullTotalPhys", ctypes.c_ulonglong),
                ("ullAvailPhys", ctypes.c_ulonglong),
                ("ullTotalPageFile", ctypes.c_ulonglong),
                ("ullAvailPageFile", ctypes.c_ulonglong),
                ("ullTotalVirtual", ctypes.c_ulonglong),
                ("ullAvailVirtual", ctypes.c_ulonglong),
                ("ullAvailExtendedVirtual", ctypes.c_ulonglong),
            ]

        status = MemoryStatusEx()
        status.dwLength = ctypes.sizeof(MemoryStatusEx)
        if ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(status)) == 0:
            return None
        return int(status.ullAvailPhys)
    try:
        page_size = os.sysconf("SC_PAGE_SIZE")
        avail_pages = os.sysconf("SC_AVPHYS_PAGES")
    except (ValueError, OSError, AttributeError):
        return None
    if page_size < 0 or avail_pages < 0:
        return None
    return int(page_size) * int(avail_pages)


def cmd_doctor() -> int:
    """Print environment diagnostics for the Windows/MOCK workflow."""

    _ensure_env_file()
    print(f"python_version: {sys.version.split()[0]}")
    print(f"python_executable: {sys.executable}")
    docker_path = _docker()
    print(f"docker_cli: {'present (' + docker_path + ')' if docker_path else 'absent'}")
    daemon = "unreachable"
    if docker_path:
        proc = _run_capture(["docker", "info"])
        daemon = "reachable" if proc.returncode == 0 else "unreachable"
        if proc.returncode != 0 and proc.stderr:
            print(f"docker_info_stderr: {proc.stderr.strip().splitlines()[-1]}")
    print(f"docker_daemon: {daemon}")
    compose_path = REPO_ROOT / "docker-compose.yml"
    compose_valid = "invalid"
    try:
        raw: object = yaml.safe_load(compose_path.read_text(encoding="utf-8"))
        if isinstance(raw, dict) and "services" in raw:
            compose_valid = "valid"
    except (OSError, yaml.YAMLError) as exc:
        print(f"compose_parse_error: {exc}")
    if docker_path and daemon == "reachable":
        cfg = _run_capture(["docker", "compose", "config", "-q"])
        if cfg.returncode != 0:
            compose_valid = "invalid"
            err = (cfg.stderr or cfg.stdout or "").strip()
            if err:
                print(f"compose_config_error: {err.splitlines()[-1]}")
    print(f"compose_file: {compose_valid} ({compose_path})")
    free = _free_ram_bytes()
    if free is None:
        print("free_ram: unknown")
    else:
        print(f"free_ram_bytes: {free}")
        print(f"free_ram_gib: {free / (1024**3):.2f}")
    return 0


TARGETS: dict[str, Callable[[], int]] = {
    "up": cmd_up,
    "down": cmd_down,
    "seed": cmd_seed,
    "test": cmd_test,
    "check": cmd_check,
    "validate": cmd_validate,
    "e2e": cmd_e2e,
    "demo": cmd_demo,
    "doctor": cmd_doctor,
}


def main(argv: Sequence[str] | None = None) -> int:
    """Dispatch a named target."""

    parser = argparse.ArgumentParser(prog="python -m attrib.tasks")
    parser.add_argument("target", choices=sorted(TARGETS))
    args = parser.parse_args(argv)
    func = TARGETS[args.target]
    return func()


if __name__ == "__main__":
    raise SystemExit(main())
