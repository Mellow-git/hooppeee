import { Fragment, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { band, corroboration, explainBand, polarityLabel } from "../lib/band";
import { formatDate, truncateHash } from "../lib/format";
import { actorCsv, actorJson, downloadText } from "../lib/export";
import { getActor, getValidation } from "../api/client";
import { useAsync } from "../lib/useAsync";
import { BandBadge, TierChip } from "../components/BandBadge";
import { CopyButton } from "../components/CopyButton";
import { EmptyState, Skeleton } from "../components/Skeleton";
import { LiteratureTag, IllustrativeTag } from "../components/Tags";
import { f1 } from "../lib/f1";
import type { LedgerRow, Polarity, Tier } from "../types";

const TABS = ["ledger", "identifiers", "infrastructure", "persona", "timeline", "export"] as const;
type Tab = (typeof TABS)[number];

function ErrorRateCell({
  row,
  illustrative,
}: {
  row: LedgerRow;
  illustrative: boolean;
}) {
  const ref = row.error_rate_ref;
  if (!ref || ref.precision == null || ref.recall == null) {
    return <span className="text-slate-500">Not yet measured</span>;
  }
  const derived = f1(ref.precision, ref.recall);
  return (
    <div className="space-y-1 text-sm">
      <p>
        {ref.kind === "literature_prior" ? "Prior" : "Local"} P {ref.precision.toFixed(2)} / R{" "}
        {ref.recall.toFixed(2)} · F1 {derived.toFixed(2)} (derived)
      </p>
      {ref.kind === "literature_prior" ? <LiteratureTag /> : null}
      {ref.kind === "local" && illustrative ? (
        <IllustrativeTag status="illustrative_placeholder" />
      ) : null}
    </div>
  );
}

function StylometryBits({ row }: { row: LedgerRow }) {
  if (row.evidence_type !== "stylometry") return null;
  const rank = row.raw_value.rank;
  const margin = row.raw_value.margin_to_runner_up;
  const n = row.raw_value.reference_set_size;
  return (
    <p className="text-xs text-slate-600">
      Rank {String(rank)} of {String(n)} · margin to #2 = {String(margin)} · reference-set size {String(n)}
    </p>
  );
}

export function ActorPage() {
  const { id = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const tab = (params.get("tab") as Tab) || "ledger";
  const { data: actor, loading } = useAsync(() => getActor(id), [id]);
  const { data: validation } = useAsync(() => getValidation(), []);
  const [tierFilter, setTierFilter] = useState<"all" | Tier>("all");
  const [polarityFilter, setPolarityFilter] = useState<"all" | Polarity>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const whyOpen = params.get("why") === "1";

  const rows = actor?.ledger ?? [];
  const b = band(rows);
  const corr = corroboration(rows);
  const illustrative = validation?.status === "illustrative_placeholder";

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (tierFilter !== "all" && r.tier !== tierFilter) return false;
      if (polarityFilter !== "all" && r.polarity !== polarityFilter) return false;
      return true;
    });
  }, [rows, tierFilter, polarityFilter]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-64" />
      </div>
    );
  }
  if (!actor) {
    return <EmptyState title="Actor not found" body="This identifier is not in the demo set." />;
  }

  const setTab = (next: Tab) => {
    const p = new URLSearchParams(params);
    p.set("tab", next);
    setParams(p);
  };

  return (
    <div className="space-y-5">
      <header className="rounded-xl bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-royal">{actor.id}</p>
            <h1 className="text-2xl font-semibold text-navy">{actor.display_name}</h1>
            <p className="mt-1 text-slate-600">{actor.category}</p>
            <p className="mt-2 text-sm text-slate-600">
              Handles: {actor.handles.join(" · ")} · First seen {formatDate(actor.first_seen)} · Last
              activity {formatDate(actor.last_activity)}
            </p>
          </div>
          <div className="max-w-md space-y-2" data-tour={actor.id === "ACT-0417" ? "ledger-high" : undefined}>
            <div className="flex flex-wrap items-center gap-3">
              <BandBadge value={b} large />
              <p className="text-[15px] font-medium text-navy">
                Corroborated by {corr} independent evidence classes
              </p>
            </div>
            <p
              className="text-xs text-slate-500"
              title="Not a probability. Open the ledger."
            >
              Not a probability. Open the ledger.
            </p>
            <button
              type="button"
              className="rounded-lg border border-royal px-3 py-1.5 text-sm font-semibold text-royal"
              data-tour={actor.id === "ACT-0233" ? "why-band" : undefined}
              onClick={() => {
                const p = new URLSearchParams(params);
                p.set("why", whyOpen ? "0" : "1");
                setParams(p);
              }}
            >
              Why this band?
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Actor sections">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={`rounded-xl px-3 py-2 text-sm capitalize ${tab === t ? "bg-navy text-white" : "bg-white text-navy shadow-sm"}`}
            onClick={() => setTab(t)}
          >
            {t === "ledger" ? "Evidence ledger" : t === "persona" ? "Persona linkage" : t}
          </button>
        ))}
      </div>

      {tab === "ledger" ? (
        <section className="overflow-hidden rounded-xl bg-white shadow-card">
          <div className="flex flex-wrap gap-2 border-b border-slate-100 p-3">
            <label className="text-sm">
              Tier{" "}
              <select
                className="rounded-md border px-2 py-1"
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as "all" | Tier)}
              >
                <option value="all">All</option>
                <option value="1">T1</option>
                <option value="2">T2</option>
                <option value="3">T3</option>
              </select>
            </label>
            <label className="text-sm">
              Polarity{" "}
              <select
                className="rounded-md border px-2 py-1"
                value={polarityFilter}
                onChange={(e) => setPolarityFilter(e.target.value as "all" | Polarity)}
              >
                <option value="all">All</option>
                <option value="supporting">Supporting</option>
                <option value="contradicting">Contradicting</option>
              </select>
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="bg-ice text-navy">
                <tr>
                  <th className="px-3 py-2">Tier</th>
                  <th className="px-3 py-2">Evidence</th>
                  <th className="px-3 py-2">Class</th>
                  <th className="px-3 py-2">Polarity</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Error rate</th>
                  <th className="px-3 py-2">Captured</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const contradict = row.polarity === "contradicting";
                  const open = openId === row.entry_id;
                  return (
                    <Fragment key={row.entry_id}>
                      <tr
                        data-tour={contradict && actor.id === "ACT-0233" ? "contradict-row" : undefined}
                        className={`cursor-pointer border-t border-slate-100 hover:bg-ice/60 ${contradict ? "border-l-4 border-l-contested bg-red-50/40" : ""}`}
                        onClick={() => setOpenId(open ? null : row.entry_id)}
                      >
                        <td className="px-3 py-3">
                          <TierChip tier={row.tier} />
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-medium text-navy">{row.evidence_type}</p>
                          <StylometryBits row={row} />
                        </td>
                        <td className="px-3 py-3">{row.independence_class}</td>
                        <td className="px-3 py-3">
                          {contradict ? (
                            <span className="font-semibold text-contested">{polarityLabel(row.polarity)}</span>
                          ) : (
                            polarityLabel(row.polarity)
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {row.source.name} · {row.source.reliability}
                        </td>
                        <td className="px-3 py-3">
                          <ErrorRateCell row={row} illustrative={Boolean(illustrative)} />
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">{formatDate(row.captured_at)}</td>
                      </tr>
                      {open ? (
                        <tr key={`${row.entry_id}-x`} className="bg-slate-50">
                          <td colSpan={7} className="px-4 py-4">
                            <p className="mb-2 font-semibold text-navy">raw_value</p>
                            <pre className="overflow-x-auto rounded-lg bg-white p-3 text-xs">
                              {JSON.stringify(row.raw_value, null, 2)}
                            </pre>
                            <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                              <p>
                                Record {row.record_id} <CopyButton value={row.record_id} label="record id" />
                              </p>
                              <p>
                                Content {truncateHash(row.content_sha256)}{" "}
                                <CopyButton value={row.content_sha256} label="content hash" />
                              </p>
                              <p>
                                Chain {truncateHash(row.chain_hash)}{" "}
                                <CopyButton value={row.chain_hash} label="chain hash" />
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === "identifiers" ? (
        <section className="rounded-xl bg-white p-5 shadow-card">
          <ul className="space-y-3">
            {actor.identifiers.map((ident) => (
              <li key={`${ident.kind}-${ident.value}`} className="rounded-lg bg-ice p-3">
                <p className="text-xs uppercase text-royal">{ident.kind}</p>
                <p className="font-medium text-navy">{ident.value}</p>
                {ident.note ? <p className="text-sm text-slate-600">{ident.note}</p> : null}
                {ident.reliability ? <p className="text-xs text-slate-500">Reliability {ident.reliability}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tab === "infrastructure" ? (
        <section className="rounded-xl bg-white p-5 shadow-card">
          {rows
            .filter((r) => r.evidence_type.startsWith("infra"))
            .map((r) => (
              <pre key={r.entry_id} className="mb-3 overflow-x-auto rounded-lg bg-ice p-3 text-xs">
                {JSON.stringify(r.raw_value, null, 2)}
              </pre>
            ))}
          {rows.every((r) => !r.evidence_type.startsWith("infra")) ? (
            <p className="text-slate-600">No infrastructure rows on this actor.</p>
          ) : null}
        </section>
      ) : null}

      {tab === "persona" ? (
        <section className="space-y-3 rounded-xl bg-white p-5 shadow-card">
          {actor.persona_linkage.length === 0 ? (
            <p className="text-slate-600">No persona linkage rows.</p>
          ) : (
            actor.persona_linkage.map((p) => (
              <div key={`${p.from_persona}-${p.to_persona}`} className="rounded-lg border border-slate-200 p-4">
                <p className="font-semibold text-navy">
                  {p.from_persona} → {p.to_persona}
                </p>
                {p.result === "withheld" ? (
                  <p className="mt-2 font-medium text-exploratory">Not analysed (withheld)</p>
                ) : (
                  <p className="mt-2 capitalize text-high">{p.result}</p>
                )}
                <p className="mt-1 text-sm text-slate-600">{p.basis}</p>
                {p.obfuscation_indicators ? (
                  <p className="mt-2 text-sm">Indicators: {p.obfuscation_indicators.join(", ")}</p>
                ) : null}
                {p.result === "withheld" ? (
                  <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-navy">
                    Withheld means not analysed. “No indicators detected” does not mean authentic.
                  </p>
                ) : null}
              </div>
            ))
          )}
        </section>
      ) : null}

      {tab === "timeline" ? (
        <section className="rounded-xl bg-white p-5 shadow-card">
          <p className="mb-3 text-slate-600">Open the full swimlane view for this actor.</p>
          <button
            type="button"
            className="rounded-xl bg-royal px-4 py-2 font-semibold text-white"
            onClick={() => navigate(`/timeline?actor=${actor.id}`)}
          >
            Open timeline
          </button>
        </section>
      ) : null}

      {tab === "export" ? (
        <section className="flex flex-wrap gap-3 rounded-xl bg-white p-5 shadow-card">
          <button
            type="button"
            className="rounded-xl bg-navy px-4 py-2 font-semibold text-white"
            onClick={() => downloadText(`${actor.id}.json`, actorJson(actor), "application/json")}
          >
            Download JSON
          </button>
          <button
            type="button"
            className="rounded-xl bg-royal px-4 py-2 font-semibold text-white"
            onClick={() => downloadText(`${actor.id}.csv`, actorCsv(actor), "text/csv")}
          >
            Download CSV
          </button>
          <Link className="rounded-xl border border-navy px-4 py-2 font-semibold text-navy" to={`/print/actors/${actor.id}`}>
            Report
          </Link>
        </section>
      ) : null}

      {whyOpen ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-navy/30" role="dialog" aria-label="Why this band">
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-card">
            <h2 className="text-xl font-semibold text-navy">Why this band?</h2>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-[15px] text-slate-800">
              {explainBand(rows).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="mt-4 text-sm text-slate-500">Corroboration count ({corr}) is separate and is not a score.</p>
            <button
              type="button"
              className="mt-6 rounded-xl bg-navy px-4 py-2 text-white"
              onClick={() => {
                const p = new URLSearchParams(params);
                p.delete("why");
                setParams(p);
              }}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
