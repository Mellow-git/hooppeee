# Decision log

Section 2 of the project brief, copied verbatim.

ID	Decision	Rejected alternatives	Reason
D1	Evidence ledger with banded confidence, no scalar score	Weighted sum or Bayesian fused score	Implies calibration we do not have
D2	Band = strongest supporting tier, downgraded to contested when contradicting evidence of equal or higher tier exists; corroboration count shown beside it, never combined	Pure MAX(tier)	Ignores conflicting evidence
D3	Infra gate requires matches in at least 2 distinct independence classes AND a per-value prevalence cutoff	Original rule: at least 2 raw fingerprint families	Cert, favicon, banner and paths often share one cause (same template or default install)
D4	Error rates stored as precision and recall; F1 is derived in code (DB generated column)	Storing F1 directly	The source report listed P=0.36, R=0.44, F1=0.27; those give F1 ≈ 0.40. Stored F1 caused the inconsistency
D5	Literature error rates are a labelled prior with provenance, shown separately from locally measured rates	One hardcoded measured_f1 on every edge	Different dataset, chain and era; not a property of this system
D6	Wallet clustering excludes CoinJoin-like transactions, applies a cluster-size cap, flags service wallets	Naive common-input-ownership	CoinJoin and exchange wallets create false mega-clusters
D7	Handles are moderate reliability unless corroborated by PGP, contact ID, or wallet	Handles as high exact-match	Common handles collide across unrelated actors
D8	Homoglyph handling uses Unicode TR39 confusable skeletons	NFKC alone	NFKC does not fold Cyrillic/Latin look-alikes
D9	Obfuscation gate reports "indicators", uses a wider signal set including author-baseline style shift; withheld means not analysed, and no-indicators never means authentic	Three fixed thresholds presented as reliable	Trivially bypassed by paraphrase or translation
D10	Stylometry reports rank, margin to runner-up, and reference-set size; requires reference set N >= 20	Bare "rank percentile"	A percentile over a tiny set is meaningless
D11	REST only (FastAPI)	GraphQL	Smaller attack surface, less to build
D12	APScheduler inside the worker	Airflow, Celery+Redis	Weight not justified for scope
D13	Docker Compose	Kubernetes	Not justified for scope
D14	Chain data via provider interface: fixture provider default, Esplora provider optional	BlockSci hard dependency	Fragile build
D15	Graph algorithms in Python (networkx) and written back to Neo4j	Neo4j GDS plugin	Plugin install and licensing friction
D16	Transformer embeddings optional, off by default	Embeddings on by default	Opaque, heavy download, weak interpretability
D17	Raw records use a hash chain (each record hashes the previous)	Independent per-record hash	Chain makes deletion or reordering detectable
D18	API keys with roles (analyst, auditor, admin); every request audited	No auth (original report)	An attribution system without access control is unacceptable
D19	httpx (SOCKS5h) + BeautifulSoup for collection; Playwright only behind a flag and never for Tier C	Scrapy + Playwright by default	One crawler is enough; less hostile-content surface
D20	Fetching through Tor uses socks5h:// so DNS resolves inside Tor	socks5://	Plain socks5 leaks DNS to the local resolver
D21	Scope: phases 0-7 required, phase 8 minimal, stretch listed	Original 8-sprint full product	Must be demonstrable in hackathon time
D22	False-lead rate shown as "not yet measured" until the validation harness measures per-comparison false-positive rate on seeded negatives	Showing an invented estimate	No invented numbers
D23	Task runner is a cross-platform Python CLI (`python -m attrib.tasks <target>`), with a thin Makefile that delegates to it	requiring GNU make (not available on the Windows dev machine), just, invoke (extra dependency)	GNU make is not available on the Windows dev machine; extra task runners are an extra dependency
