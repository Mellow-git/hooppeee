import { useState } from "react";
import { getScanMetrics, getValidation } from "../api/client";
import { useAsync } from "../lib/useAsync";
import { daysAgo } from "../lib/format";
import { Skeleton } from "../components/Skeleton";
import { IllustrativeTag } from "../components/Tags";

function Funnel({
  steps,
}: {
  steps: { label: string; n: number }[];
}) {
  const max = Math.max(...steps.map((s) => s.n), 1);
  return (
    <div className="space-y-2" data-tour="funnel">
      {steps.map((s) => (
        <div key={s.label}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-navy">{s.label}</span>
            <span className="font-semibold tabular-nums">{s.n.toLocaleString()}</span>
          </div>
          <div className="h-3 rounded-full bg-ice">
            <div className="h-3 rounded-full bg-royal" style={{ width: `${(s.n / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function InfrastructurePage() {
  const { data, loading } = useAsync(() => getScanMetrics(), []);
  const { data: validation } = useAsync(() => getValidation(), []);
  const [stale, setStale] = useState(false);
  const [previewRate, setPreviewRate] = useState(false);
  if (loading || !data) return <Skeleton className="h-64" />;

  const refreshed = stale ? data.exclusion_list.stale_sample_last_refreshed : data.exclusion_list.last_refreshed;
  const age = daysAgo(refreshed);
  const staleWarn = age > 7;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-navy">Infrastructure</h1>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[
          ["Comparisons", data.comparisons],
          ["Fingerprint matches", data.fingerprint_matches],
          ["Discarded template_common", data.discarded_template_common],
          ["Discarded excluded ASN", data.discarded_excluded_asn],
          ["Single-class logged only", data.single_class_logged_only],
          ["Multi-signal confirmed", data.multi_signal_confirmed],
        ].map(([label, n]) => (
          <div key={String(label)} className="rounded-xl bg-white p-4 shadow-card">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-2xl font-semibold text-navy">{Number(n).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <section className="rounded-xl bg-white p-5 shadow-card">
        <h2 className="mb-4 font-semibold text-navy">Confirmation funnel</h2>
        <Funnel
          steps={[
            { label: "Fingerprint matches", n: data.funnel.fingerprint_matches },
            { label: "After prevalence cutoff", n: data.funnel.after_prevalence_cutoff },
            { label: "After ASN exclusion", n: data.funnel.after_asn_exclusion },
            { label: "2+ independent classes", n: data.funnel.two_plus_classes },
            { label: "Confirmed", n: data.funnel.confirmed },
          ]}
        />
      </section>
      <section className="overflow-x-auto rounded-xl bg-white p-5 shadow-card">
        <h2 className="mb-3 font-semibold text-navy">Candidates</h2>
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-ice">
            <tr>
              <th className="px-2 py-2">Onion</th>
              <th className="px-2 py-2">Candidate IP</th>
              <th className="px-2 py-2">Classes</th>
              <th className="px-2 py-2">Gate</th>
              <th className="px-2 py-2">Reason</th>
            </tr>
          </thead>
          <tbody>
            {data.candidates.map((c) => (
              <tr key={c.onion} className="border-t">
                <td className="px-2 py-2 font-mono text-xs">{c.onion}</td>
                <td className="px-2 py-2">{c.candidate_ip}</td>
                <td className="px-2 py-2">{c.classes_matched.join(", ")}</td>
                <td className="px-2 py-2">{c.gate_status}</td>
                <td className="px-2 py-2">{c.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl bg-white p-5 shadow-card">
          <h2 className="font-semibold text-navy">Exclusion list freshness</h2>
          <p className="mt-2 text-sm">Last refreshed {refreshed.slice(0, 10)} ({age} days ago)</p>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={stale} onChange={() => setStale((v) => !v)} />
            Preview stale sample
          </label>
          {staleWarn ? (
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm font-medium text-exploratory" role="alert">
              Exclusion list is stale (older than 7 days). ASN and template filters may be outdated.
            </p>
          ) : (
            <p className="mt-3 text-sm text-high">Exclusion list is fresh.</p>
          )}
        </section>
        <section className="rounded-xl bg-white p-5 shadow-card">
          <h2 className="font-semibold text-navy">False-lead rate</h2>
          {data.false_lead_rate == null && !previewRate ? (
            <p className="mt-2 text-lg font-semibold text-navy">Not yet measured</p>
          ) : (
            <p className="mt-2 text-lg font-semibold text-navy">
              {(data.false_lead_rate ?? 0.014).toFixed(3)}{" "}
              <span className="text-sm font-normal text-slate-500">layout preview only</span>
            </p>
          )}
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={previewRate} onChange={() => setPreviewRate((v) => !v)} />
            Preview numeric state
          </label>
          {validation?.status === "illustrative_placeholder" ? (
            <div className="mt-2">
              <IllustrativeTag status={validation.status} />
            </div>
          ) : null}
          <p className="mt-3 text-sm text-slate-600">{data.coinjoin_excluded.note}</p>
          <p className="mt-2 text-sm text-slate-600">
            Service cluster: {data.service_wallet_cluster.size.toLocaleString()} addresses,{" "}
            {data.service_wallet_cluster.flag}. {data.service_wallet_cluster.note}
          </p>
        </section>
      </div>
    </div>
  );
}
