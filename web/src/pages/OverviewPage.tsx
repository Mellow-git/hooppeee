import { Link } from "react-router-dom";
import {
  getErrorRates,
  getGraph,
  getScanMetrics,
  getSources,
  getValidation,
  listActors,
} from "../api/client";
import activity from "../data/activity.json";
import { useAsync } from "../lib/useAsync";
import { band, corroboration } from "../lib/band";
import { f1 } from "../lib/f1";
import { daysAgo } from "../lib/format";
import { HOMoglyph_DEMO } from "../constants";
import { BandBadge } from "../components/BandBadge";
import { Skeleton } from "../components/Skeleton";
import { IllustrativeTag, LiteratureTag } from "../components/Tags";
import { downloadText, overviewCsv, overviewJson } from "../lib/export";
import type { Actor, Band } from "../types";

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-navy">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function BandBars({ actors }: { actors: Actor[] }) {
  const counts: Record<Band, number> = {
    high: 0,
    moderate: 0,
    exploratory: 0,
    contested: 0,
    none: 0,
  };
  for (const a of actors) counts[band(a.ledger)] += 1;
  const max = Math.max(1, ...Object.values(counts));
  const order: Band[] = ["high", "moderate", "exploratory", "contested", "none"];
  const colors: Record<Band, string> = {
    high: "#1B7F4B",
    moderate: "#1F4FBF",
    exploratory: "#B7791F",
    contested: "#C62828",
    none: "#64748b",
  };
  return (
    <svg viewBox="0 0 360 160" className="h-40 w-full" role="img" aria-label="Band distribution">
      {order.map((k, i) => {
        const h = (counts[k] / max) * 110;
        const x = 24 + i * 68;
        return (
          <g key={k}>
            <rect x={x} y={130 - h} width={44} height={h} rx="6" fill={colors[k]} />
            <text x={x + 22} y={148} textAnchor="middle" fontSize="10" fill="#0B2A5B">
              {k}
            </text>
            <text x={x + 22} y={124 - h} textAnchor="middle" fontSize="12" fill="#0B2A5B">
              {counts[k]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function SectionHead({ title, to }: { title: string; to: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="font-semibold text-navy">{title}</h2>
      <Link className="text-sm font-semibold text-royal hover:underline" to={to}>
        Open
      </Link>
    </div>
  );
}

export function OverviewPage() {
  const { data: actors, loading: la } = useAsync(() => listActors(), []);
  const { data: sources, loading: ls } = useAsync(() => getSources(), []);
  const { data: infra, loading: li } = useAsync(() => getScanMetrics(), []);
  const { data: validation, loading: lv } = useAsync(() => getValidation(), []);
  const { data: priors } = useAsync(() => getErrorRates(), []);
  const { data: graph } = useAsync(() => getGraph("CLU-0001"), []);

  if (la || ls || li || lv || !actors || !sources || !infra || !validation) {
    return (
      <div className="grid gap-3 md:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-64 md:col-span-3" />
      </div>
    );
  }

  const evidence = actors.reduce((n, a) => n + a.ledger.length, 0);
  const high = actors.filter((a) => band(a.ledger) === "high").length;
  const contested = actors.filter((a) => band(a.ledger) === "contested");
  const lastCollection = sources.reduce((m, s) => (s.last_scan > m ? s.last_scan : m), "");
  const review = [...actors].sort((a, b) => {
    const ac = band(a.ledger) === "contested" ? 0 : 1;
    const bc = band(b.ledger) === "contested" ? 0 : 1;
    return ac - bc;
  });
  const unreachable = sources.filter((s) => s.status === "unreachable").length;
  const degraded = sources.filter((s) => s.status === "degraded").length;
  const chainOk = sources.filter((s) => s.hash_chain === "verified").length;
  const identCount = actors.reduce((n, a) => n + a.identifiers.length, 0);
  const withheld = actors.flatMap((a) => a.persona_linkage.filter((p) => p.result === "withheld"));
  const exclAge = daysAgo(infra.exclusion_list.last_refreshed);
  const funnel = [
    ["Fingerprint matches", infra.funnel.fingerprint_matches],
    ["After prevalence", infra.funnel.after_prevalence_cutoff],
    ["After ASN exclusion", infra.funnel.after_asn_exclusion],
    ["2+ classes", infra.funnel.two_plus_classes],
    ["Confirmed", infra.funnel.confirmed],
  ] as const;
  const maxFunnel = Math.max(...funnel.map(([, n]) => n), 1);
  const scenarioPass = validation.scenarios.filter((s) => s.result === "pass").length;
  const nodeCounts = graph
    ? {
        actor: graph.nodes.filter((n) => n.type === "actor").length,
        identifier: graph.nodes.filter((n) => n.type === "identifier").length,
        infra: graph.nodes.filter((n) => n.type === "infra").length,
        persona: graph.nodes.filter((n) => n.type === "persona").length,
        excluded: graph.nodes.filter((n) => n.type === "excluded_cluster").length,
        edges: graph.edges.length,
      }
    : null;
  const lit = priors?.[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Dashboard</h1>
          <p className="text-sm text-slate-600">
            Jury snapshot of every surface: actors, graph, infra, validation, sources, search, method.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-xl bg-navy px-3 py-2 text-sm font-semibold text-white"
            onClick={() => downloadText("overview.json", overviewJson(actors), "application/json")}
          >
            JSON
          </button>
          <button
            type="button"
            className="rounded-xl bg-royal px-3 py-2 text-sm font-semibold text-white"
            onClick={() => downloadText("overview.csv", overviewCsv(actors), "text/csv")}
          >
            CSV
          </button>
          <Link className="rounded-xl border border-navy px-3 py-2 text-sm font-semibold text-navy" to="/print/overview">
            Report
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Actors tracked" value={actors.length} hint={`${identCount} identifiers`} />
        <Kpi label="Evidence items" value={evidence} hint="Ledger rows, not a score" />
        <Kpi label="HIGH leads" value={high} hint="Strongest supporting tier = 1" />
        <Kpi label="Contested · review" value={contested.length} hint="Equal/stronger contradiction" />
        <Kpi label="Sources" value={sources.length} hint={`${unreachable} unreachable · ${degraded} degraded`} />
        <Kpi label="Last collection" value={lastCollection.slice(0, 10)} hint={`${chainOk}/${sources.length} chains verified`} />
        <Kpi label="Infra confirmed" value={infra.multi_signal_confirmed} hint={`${infra.comparisons.toLocaleString()} comparisons`} />
        <Kpi
          label="False-lead rate"
          value={infra.false_lead_rate == null ? "Not yet measured" : infra.false_lead_rate}
          hint="No invented measurement"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-xl bg-white p-5 shadow-card">
          <SectionHead title="Band distribution" to="/actors" />
          <BandBars actors={actors} />
          <p className="mt-2 text-xs text-slate-500">
            Bands are not probabilities. Corroboration is a separate class count.
          </p>
        </section>
        <section className="rounded-xl bg-white p-5 shadow-card" data-tour="needs-review">
          <SectionHead title="Needs analyst review" to="/actors" />
          <ul className="space-y-2">
            {review.map((a) => (
              <li key={a.id}>
                <Link
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg p-2 hover:bg-ice"
                  to={`/actors/${a.id}`}
                >
                  <span className="min-w-0">
                    <span className="font-medium text-navy">
                      {a.id} {a.display_name}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {a.category} · {a.handles.join(", ")} · {corroboration(a.ledger)}{" "}
                      {corroboration(a.ledger) === 1 ? "class" : "classes"}
                    </span>
                  </span>
                  <BandBadge value={band(a.ledger)} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-xl bg-white p-5 shadow-card">
        <SectionHead title="Actor briefs" to="/actors" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {actors.map((a) => {
            const b = band(a.ledger);
            const contradict = a.ledger.filter((r) => r.polarity === "contradicting");
            return (
              <Link key={a.id} to={`/actors/${a.id}`} className="rounded-xl bg-ice p-4 hover:ring-2 hover:ring-royal">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-royal">{a.id}</p>
                    <p className="font-semibold text-navy">{a.display_name}</p>
                  </div>
                  <BandBadge value={b} />
                </div>
                <p className="mt-2 text-sm text-slate-600">{a.category}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Seen {a.first_seen.slice(0, 10)} → {a.last_activity.slice(0, 10)}
                </p>
                <p className="mt-2 text-sm text-navy">
                  Corroborated by {corroboration(a.ledger)} independent{" "}
                  {corroboration(a.ledger) === 1 ? "class" : "classes"} · {a.ledger.length}{" "}
                  {a.ledger.length === 1 ? "row" : "rows"}
                </p>
                {contradict.length ? (
                  <p className="mt-2 text-sm font-medium text-contested">
                    {contradict.length} contradicting row{contradict.length === 1 ? "" : "s"}
                  </p>
                ) : null}
                {a.persona_linkage.some((p) => p.result === "withheld") ? (
                  <p className="mt-1 text-sm text-exploratory">Persona linkage withheld (not analysed)</p>
                ) : null}
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-5 shadow-card">
          <SectionHead title="Infrastructure funnel" to="/infrastructure" />
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            <p>
              Matches <span className="font-semibold text-navy">{infra.fingerprint_matches}</span>
            </p>
            <p>
              Template drop <span className="font-semibold text-navy">{infra.discarded_template_common}</span>
            </p>
            <p>
              ASN drop <span className="font-semibold text-navy">{infra.discarded_excluded_asn}</span>
            </p>
            <p>
              Single-class <span className="font-semibold text-navy">{infra.single_class_logged_only}</span>
            </p>
            <p>
              Confirmed <span className="font-semibold text-navy">{infra.multi_signal_confirmed}</span>
            </p>
            <p>
              Exclusion list <span className="font-semibold text-navy">{exclAge}d</span>
            </p>
          </div>
          <div className="mt-3 space-y-2">
            {funnel.map(([label, n]) => (
              <div key={label}>
                <div className="mb-0.5 flex justify-between text-xs text-navy">
                  <span>{label}</span>
                  <span className="font-semibold">{n.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-ice">
                  <div className="h-2 rounded-full bg-royal" style={{ width: `${(n / maxFunnel) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-600">{infra.coinjoin_excluded.note}</p>
          <p className="mt-1 text-sm text-slate-600">
            Service cluster: {infra.service_wallet_cluster.size.toLocaleString()} addresses ·{" "}
            {infra.service_wallet_cluster.flag}. {infra.service_wallet_cluster.note}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Top candidate gates: {infra.candidates.map((c) => `${c.gate_status}`).join(" · ")}
          </p>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-card">
          <SectionHead title="Validation (F1 always derived)" to="/validation" />
          <div className="mb-3">
            <IllustrativeTag status={validation.status} />
          </div>
          <table className="w-full text-left text-sm">
            <thead className="text-navy">
              <tr>
                <th className="py-1">Method</th>
                <th>P</th>
                <th>R</th>
                <th>F1</th>
                <th>n</th>
              </tr>
            </thead>
            <tbody>
              {validation.methods.map((m) => (
                <tr key={m.method} className="border-t border-slate-100">
                  <td className="py-1.5">{m.method}</td>
                  <td>{m.precision.toFixed(2)}</td>
                  <td>{m.recall.toFixed(2)}</td>
                  <td>{f1(m.precision, m.recall).toFixed(2)}</td>
                  <td>{m.n_cases}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {lit ? (
            <div className="mt-3 rounded-lg bg-ice p-3 text-sm">
              <p className="font-medium text-navy">
                Literature prior {lit.method}: P {lit.precision.toFixed(2)} / R {lit.recall.toFixed(2)} · F1{" "}
                {f1(lit.precision, lit.recall).toFixed(2)} (derived)
              </p>
              <div className="mt-1">
                <LiteratureTag />
              </div>
            </div>
          ) : null}
          <p className="mt-3 text-sm text-navy">
            Scenario checklist {scenarioPass}/{validation.scenarios.length} pass
          </p>
          <ul className="mt-1 columns-1 text-xs text-slate-600 sm:columns-2">
            {validation.scenarios.map((s) => (
              <li key={s.id} className="mb-1 break-inside-avoid">
                <span className={s.result === "pass" ? "font-semibold text-high" : "font-semibold text-contested"}>
                  {s.result.toUpperCase()}
                </span>{" "}
                {s.label}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-5 shadow-card">
          <SectionHead title="Sources" to="/sources" />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-ice text-navy">
                <tr>
                  <th className="px-2 py-1.5">Source</th>
                  <th>Tier</th>
                  <th>Status</th>
                  <th>Cadence</th>
                  <th>Chain</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((s) => (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="px-2 py-1.5 font-medium">{s.name}</td>
                    <td>{s.reliability}</td>
                    <td className={s.status === "unreachable" ? "font-semibold text-contested" : ""}>{s.status}</td>
                    <td>{s.cadence}</td>
                    <td>{s.hash_chain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-card">
          <SectionHead title="Network graph" to="/graph" />
          {nodeCounts ? (
            <p className="text-sm text-slate-700">
              {nodeCounts.actor} actors · {nodeCounts.identifier} identifiers · {nodeCounts.infra} infra ·{" "}
              {nodeCounts.persona} personas · {nodeCounts.excluded} excluded cluster · {nodeCounts.edges} LINKED_TO
              edges
            </p>
          ) : null}
          <p className="mt-2 rounded-lg bg-slate-100 p-3 text-sm text-navy">
            Service wallet suspected (1,240 addresses), excluded from linking. Handle collision night0wl stays
            handle-only / moderate.
          </p>
          <svg viewBox="0 0 280 140" className="mt-3 w-full" aria-hidden>
            <circle cx="140" cy="70" r="18" fill="#0B2A5B" />
            <circle cx="40" cy="40" r="12" fill="#1F4FBF" />
            <circle cx="240" cy="40" r="12" fill="#1F4FBF" />
            <circle cx="50" cy="110" r="12" fill="#B7791F" />
            <circle cx="230" cy="110" r="14" fill="#94a3b8" />
            <line x1="140" y1="70" x2="40" y2="40" stroke="#1F4FBF" strokeDasharray="4 3" />
            <line x1="140" y1="70" x2="240" y2="40" stroke="#1F4FBF" strokeDasharray="4 3" />
            <line x1="140" y1="70" x2="50" y2="110" stroke="#1F4FBF" strokeDasharray="4 3" />
          </svg>
          <Link className="mt-2 inline-block text-sm font-semibold text-royal" to="/timeline?actor=ACT-0417">
            Open ShadowLedger timeline
          </Link>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl bg-white p-5 shadow-card">
          <SectionHead title="Search" to={`/search?q=${encodeURIComponent(HOMoglyph_DEMO)}`} />
          <p className="text-sm text-slate-700">
            One box auto-detects handle / wallet / PGP / onion. Confusable skeleton maps Cyrillic ѕ → Latin s.
          </p>
          <Link
            className="mt-3 inline-block rounded-xl bg-ice px-3 py-2 text-sm font-semibold text-royal"
            to={`/search?q=${encodeURIComponent(HOMoglyph_DEMO)}`}
          >
            Try: {HOMoglyph_DEMO}
          </Link>
        </section>
        <section className="rounded-xl bg-white p-5 shadow-card">
          <SectionHead title="Recent activity" to="/timeline" />
          <ul className="space-y-1.5 text-sm text-slate-700">
            {activity.slice(0, 6).map((row) => (
              <li key={row.at + row.text}>
                <span className="text-slate-500">{row.at.slice(0, 10)}</span> · {row.text}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl bg-white p-5 shadow-card">
          <SectionHead title="Method (About)" to="/about" />
          <p className="text-sm text-slate-700">
            Three engines feed a ledger. No fused score. Passive OSINT only. Withheld = not analysed
            {withheld.length ? ` (${withheld.length} persona row)` : ""}. “No indicators detected” does not mean
            authentic.
          </p>
        </section>
      </div>
    </div>
  );
}
