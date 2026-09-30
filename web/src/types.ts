export type Band = "high" | "moderate" | "exploratory" | "contested" | "none";
export type Polarity = "supporting" | "contradicting";
export type Tier = 1 | 2 | 3;
export type Reliability = "A" | "B" | "C" | "D";
export type ValidationStatus = "illustrative_placeholder" | "measured";
export type ErrorRateKind = "literature_prior" | "local";

export interface SourceRef {
  id: string;
  name: string;
  reliability: Reliability;
}

export interface ErrorRateRef {
  kind: ErrorRateKind;
  label: string;
  precision: number | null;
  recall: number | null;
  dataset_note?: string;
}

export interface LedgerRow {
  entry_id: string;
  evidence_type: string;
  tier: Tier;
  polarity: Polarity;
  independence_class: string;
  source: SourceRef;
  error_rate_ref: ErrorRateRef | null;
  raw_value: Record<string, unknown>;
  captured_at: string;
  record_id: string;
  content_sha256: string;
  chain_hash: string;
}

export interface Identifier {
  kind: "handle" | "wallet" | "pgp" | "onion" | "contact";
  value: string;
  note?: string;
  reliability?: "high" | "moderate" | "low";
}

export interface PersonaLink {
  from_persona: string;
  to_persona: string;
  result: "linked" | "withheld" | "unlinked";
  basis: string;
  obfuscation_indicators?: string[];
}

export interface Actor {
  id: string;
  display_name: string;
  handles: string[];
  category: string;
  first_seen: string;
  last_activity: string;
  identifiers: Identifier[];
  persona_linkage: PersonaLink[];
  ledger: LedgerRow[];
  notes?: string[];
}

export interface TimelineEvent {
  id: string;
  actor_id: string;
  source_id: string;
  source_name: string;
  kind: "post" | "handle_change" | "rebrand" | "wallet";
  at: string;
  label: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: "actor" | "identifier" | "infra" | "persona" | "excluded_cluster";
  subtype?: string;
  actor_id?: string;
  detail?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  kind: "LINKED_TO";
  tier: Tier | null;
  dashed?: boolean;
}

export interface GraphPayload {
  cluster_id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface InfraCandidate {
  onion: string;
  candidate_ip: string;
  classes_matched: string[];
  gate_status: "confirmed" | "rejected" | "logged_only";
  reason: string;
}

export interface ScanMetrics {
  comparisons: number;
  fingerprint_matches: number;
  discarded_template_common: number;
  discarded_excluded_asn: number;
  single_class_logged_only: number;
  multi_signal_confirmed: number;
  funnel: {
    fingerprint_matches: number;
    after_prevalence_cutoff: number;
    after_asn_exclusion: number;
    two_plus_classes: number;
    confirmed: number;
  };
  candidates: InfraCandidate[];
  exclusion_list: {
    last_refreshed: string;
    stale_sample_last_refreshed: string;
    entries: string[];
  };
  false_lead_rate: number | null;
  coinjoin_excluded: {
    txid: string;
    note: string;
  };
  service_wallet_cluster: {
    size: number;
    flag: string;
    note: string;
  };
}

export interface ValidationMethod {
  method: string;
  precision: number;
  recall: number;
  n_cases: number;
  seed: number;
}

export interface ScenarioRow {
  id: string;
  label: string;
  result: "pass" | "fail";
}

export interface ValidationPayload {
  status: ValidationStatus;
  seed: number;
  methods: ValidationMethod[];
  scenarios: ScenarioRow[];
}

export interface LiteraturePrior {
  id: string;
  method: string;
  precision: number;
  recall: number;
  note: string;
}

export interface SourceRecord {
  id: string;
  name: string;
  reliability: Reliability;
  cadence: string;
  status: "ok" | "unreachable" | "degraded";
  last_scan: string;
  hash_chain: "verified" | "pending" | "break";
  url_public: string;
}

export type QueryType = "handle" | "wallet" | "pgp" | "onion";

export interface SearchHit {
  actor: Actor;
  matched_on: string;
  query_type: QueryType;
  confusable_match: boolean;
}
