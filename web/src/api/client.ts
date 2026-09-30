import type {
  Actor,
  GraphPayload,
  LiteraturePrior,
  QueryType,
  ScanMetrics,
  SearchHit,
  SourceRecord,
  TimelineEvent,
  ValidationPayload,
} from "../types";
import { skeleton } from "../lib/skeleton";
import actorsJson from "../data/actors.json";
import timelinesJson from "../data/timelines.json";
import graphJson from "../data/graph.json";
import infraJson from "../data/infra.json";
import validationJson from "../data/validation.json";
import errorRatesJson from "../data/error-rates.json";
import sourcesJson from "../data/sources.json";

const actors = actorsJson as Actor[];
const timelines = timelinesJson as Record<string, TimelineEvent[]>;
const graph = graphJson as GraphPayload;
const infra = infraJson as ScanMetrics;
const validation = validationJson as ValidationPayload;
const errorRates = errorRatesJson as LiteraturePrior[];
const sources = sourcesJson as SourceRecord[];

export type FallbackListener = (fallback: boolean) => void;

let fallback = false;
const listeners = new Set<FallbackListener>();

export function subscribeFallback(fn: FallbackListener): () => void {
  listeners.add(fn);
  fn(fallback);
  return () => listeners.delete(fn);
}

function setFallback(value: boolean) {
  fallback = value;
  listeners.forEach((fn) => fn(value));
}

function sourceMode(): "mock" | "api" {
  return import.meta.env.VITE_DATA_SOURCE === "api" ? "api" : "mock";
}

async function apiGet<T>(path: string): Promise<T> {
  const base = import.meta.env.VITE_API_BASE ?? "";
  const key = import.meta.env.VITE_API_KEY ?? "";
  const res = await fetch(`${base}${path}`, {
    headers: { "X-API-Key": key },
  });
  if (!res.ok) throw new Error(`API ${path} ${res.status}`);
  return (await res.json()) as T;
}

async function withFallback<T>(path: string, mock: T): Promise<T> {
  if (sourceMode() !== "api") {
    setFallback(false);
    return mock;
  }
  try {
    const data = await apiGet<T>(path);
    setFallback(false);
    return data;
  } catch {
    setFallback(true);
    return mock;
  }
}

export function detectQueryType(q: string): QueryType {
  const v = q.trim();
  if (v.endsWith(".onion")) return "onion";
  if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{20,}$/.test(v) || /^0x[a-fA-F0-9]{40}$/.test(v)) {
    return "wallet";
  }
  const hex = v.replace(/[\s:]/g, "");
  if (/^[a-fA-F0-9]{40}$/.test(hex)) return "pgp";
  return "handle";
}

function mockSearch(q: string): SearchHit[] {
  const query = q.trim();
  if (!query) return [];
  const type = detectQueryType(query);
  const qSkel = skeleton(query);
  const hits: SearchHit[] = [];
  for (const actor of actors) {
    for (const ident of actor.identifiers) {
      const value = ident.value;
      const identType =
        ident.kind === "pgp"
          ? "pgp"
          : ident.kind === "wallet"
            ? "wallet"
            : ident.kind === "onion"
              ? "onion"
              : "handle";
      if (type !== identType && type !== "handle") continue;
      const exact = value.toLowerCase().includes(query.toLowerCase()) || query.toLowerCase().includes(value.toLowerCase());
      const skelHit = skeleton(value) === qSkel || skeleton(value).includes(qSkel);
      if (!exact && !skelHit) continue;
      if (type !== "handle" && identType !== type && !exact) continue;
      hits.push({
        actor,
        matched_on: value,
        query_type: type,
        confusable_match: type === "handle" && skelHit && skeleton(query) === skeleton(value) && query !== value,
      });
      break;
    }
  }
  return hits;
}

export async function searchActors(q: string): Promise<SearchHit[]> {
  return withFallback(`/actors/search?q=${encodeURIComponent(q)}`, mockSearch(q));
}

export async function listActors(): Promise<Actor[]> {
  return withFallback("/actors/search?q=", actors);
}

export async function getActor(id: string): Promise<Actor | null> {
  const found = actors.find((a) => a.id === id) ?? null;
  return withFallback(`/actors/${id}`, found);
}

export async function getLedger(id: string) {
  const found = actors.find((a) => a.id === id);
  return withFallback(`/actors/${id}/ledger`, found?.ledger ?? []);
}

export async function getTimeline(id: string): Promise<TimelineEvent[]> {
  return withFallback(`/actors/${id}/timeline`, timelines[id] ?? []);
}

export async function getGraph(clusterId: string): Promise<GraphPayload> {
  return withFallback(`/clusters/${clusterId}/graph`, graph);
}

export async function getScanMetrics(): Promise<ScanMetrics> {
  return withFallback("/infra/scan-metrics", infra);
}

export async function getValidation(): Promise<ValidationPayload> {
  return withFallback("/validation/latest", validation);
}

export async function getErrorRates(): Promise<LiteraturePrior[]> {
  return withFallback("/error-rates", errorRates);
}

export async function getSources(): Promise<SourceRecord[]> {
  return withFallback("/sources", sources);
}

export function allActorsSync(): Actor[] {
  return actors;
}
