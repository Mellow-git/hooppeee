# attrib

Passive correlation of **public** data into investigative leads for lawful authorities. This is not a scanning, exploitation, or identity-proof tool.

Every API response, export, and UI view includes:

> Investigative lead only. Not proof of identity. Confidence bands summarise the strongest supporting evidence tier; they are not probabilities.

## Rules of engagement

**Allowed:** GET of watchlisted public pages; query third-party scan databases through a provider interface; read public chain data; analyse already-collected public text.

**Forbidden (not implemented):** probing hosts beyond that GET; attacks on Tor; logging in or evading anti-bot; malware or exploits.

## Modes

- **MOCK** (default): offline against `fixtures/` and the mock-market container. No internet required.
- **LIVE**: `ENABLE_LIVE=1`, a watchlist file, and Compose profile `live`. Logs a warning at startup. Fetches use `socks5h://` so DNS stays inside Tor.

## Setup (Windows PowerShell)

GNU make is optional. The task runner is `python -m attrib.tasks <target>` (D23). From the repo root:

```powershell
Copy-Item .env.example .env
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
python -m attrib.tasks doctor
python -m attrib.tasks check
python -m attrib.tasks test
python -m attrib.tasks up
```

Dashboard: http://localhost:5173  
API health: http://localhost:8000/health

If execution policy blocks the venv activate script:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

WSL2 (Docker Desktop) should leave the VM enough RAM. Recommended `%UserProfile%\.wslconfig`:

```ini
[wsl2]
memory=6GB
processors=6
```

The Compose file caps the MOCK stack at about 5 GB (see the comment at the top of `docker-compose.yml`).

## Task targets

Run with `python -m attrib.tasks <target>`. If GNU make is installed, `make <target>` delegates to the same CLI.

| Target | PowerShell | Purpose |
| doctor | `python -m attrib.tasks doctor` | Python version, Docker CLI/daemon, compose validity, free RAM |
| check | `python -m attrib.tasks check` | ruff + mypy --strict on `attrib/` |
| test | `python -m attrib.tasks test` | pytest (includes `@pytest.mark.integration` when Compose is up) |
| up | `python -m attrib.tasks up` | Compose build/start; waits until postgres, neo4j, and minio are healthy |
| down | `python -m attrib.tasks down` | Compose down |
| seed | `python -m attrib.tasks seed` | Regenerate fixtures (Phase 8; NotImplementedError until then) |
| validate | `python -m attrib.tasks validate` | Validation harness (Phase 8) |
| e2e | `python -m attrib.tasks e2e` | pytest `tests/e2e` |
| demo | `python -m attrib.tasks demo` | `up` plus dashboard URLs (seed waits for Phase 8) |

Skip Compose-backed tests when the stack is down:

```powershell
python -m pytest tests -q --tb=short -m "not integration"
```

## Phases

0 scaffold (this tree) → 1 storage/collector → 2 extract → 3 infra → 4 identity → 5 persona → 6 ledger/API/export → 7 dashboard → 8 validation/demo.

Unimplemented behaviour raises `NotImplementedError` (HTTP 501 on the API). Pytest uses `xfail_strict = true`.

## Validation

`python -m attrib.tasks validate` (or `python -m attrib.cli validate --seed N`) builds a synthetic world and writes `reports/validation.md`. Literature priors stay labelled PLACEHOLDER until verified; see `docs/TODO_VERIFY.md`.

## Docs

- `docs/DECISIONS.md` — decision log (brief Section 2 plus D23)
- `docs/ARCHITECTURE.md` — components and data flow
- `docs/TODO_VERIFY.md` — every placeholder awaiting a source
