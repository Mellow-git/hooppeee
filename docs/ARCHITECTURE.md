# Architecture

Passive correlation of **public** data into investigative leads for lawful authorities. The system does not probe hosts, exploit services, bypass authentication, or attack Tor.

## Run modes

- **MOCK** (default): offline against seeded fixtures and the mock-market container. No internet required.
- **LIVE**: requires `ENABLE_LIVE=1`, a watchlist file, and the Compose `live` profile. The API/worker log a warning at startup. Collection egress is only via Tor (`socks5h://`) on an internal network.

## Process

1. **Collector** fetches watchlisted public pages (`SourceFetcher`). Bodies go to MinIO; metadata and a hash chain go to PostgreSQL in one transaction.
2. **Extract** parses hostile HTML into typed records and normalises identifiers (PGP, BTC, ETH, handles with TR39 skeletons, contacts).
3. **Infra gate** queries a scan-provider interface (fixture in MOCK). Confirmation requires ≥2 independence classes after prevalence and ASN exclusion checks. Single-class matches are audited only.
4. **Identity** writes actors and identifiers to Neo4j. Wallet clustering uses common-input-ownership after CoinJoin/mixer exclusion and a cluster-size cap.
5. **Persona** runs an obfuscation-indicator gate, then rank/margin/N stylometry (never a percentile). Behavioural signals are separate Tier 3 rows.
6. **Ledger** stores one row per evidence item. Band is the strongest supporting tier, contested if equal-or-stronger contradiction exists. Corroboration is an independent-class count shown beside the band, never fused.
7. **API / dashboard / export** always include the disclosure text. Roles: analyst, auditor, admin. Every request is audited.

## Confidence bands (D1, D2)

Bands: `high` | `moderate` | `exploratory` | `contested` | `none`.

There is **no scalar score**. Stylometry cannot raise a band above exploratory.

## Storage

- **PostgreSQL 16**: sources, raw records (hash chain), ledger, error-rate literature priors (P/R; F1 generated), local validation, API keys (SHA-256 only), audit, infra audit, scan metrics.
- **Neo4j 5 Community**: actors, identifiers, infra indicators, persona linkages, sources, graph edges with `error_rate_ref_id` (never copied error-rate values).
- **MinIO**: raw fetch bodies.
- **Graph algorithms**: networkx in a worker batch; results written back to Neo4j (D15).

## Services (Compose)

`postgres`, `neo4j`, `minio`, `mock-market`, `api`, `worker`, `worker-tierc` (CPU/memory limited, no JS rendering), `web`. `tor` is Compose profile `live` only. In LIVE, `collector_net` is `internal: true` and reaches only `tor`.

## Forbidden (not implemented, not stubbed)

Direct scanning/probing of onion or clearnet hosts beyond a single GET of a watchlisted page; attacks on Tor; login or anti-bot evasion; malware or exploit code; GraphQL; Neo4j GDS as a required plugin; invented statistics.

## Placeholder values

Literature error rates and several persona thresholds are labelled PLACEHOLDER and listed in `docs/TODO_VERIFY.md`. The UI and API must not present them as measured properties of this system.
