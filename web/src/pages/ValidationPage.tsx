import { getErrorRates, getValidation } from "../api/client";
import { useAsync } from "../lib/useAsync";
import { AccuracyBlock } from "../components/AccuracyBlock";
import { Skeleton } from "../components/Skeleton";
import { IllustrativeTag, MeasuredTag } from "../components/Tags";
import { f1 } from "../lib/f1";

export function ValidationPage() {
  const { data, loading } = useAsync(() => getValidation(), []);
  const { data: priors } = useAsync(() => getErrorRates(), []);
  if (loading || !data) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-navy">Validation</h1>
        <div data-tour="illustrative-tag">
          <IllustrativeTag status={data.status} />
          <MeasuredTag seed={data.seed} status={data.status} />
        </div>
      </div>
      <p className="rounded-xl bg-amber-50 p-4 text-sm text-navy">
        Honesty note: these figures are synthetic fixtures for the jury demo. They are not claimed as
        measured operational performance unless the status is measured.
      </p>
      <section className="overflow-x-auto rounded-xl bg-white p-5 shadow-card">
        <h2 className="mb-3 font-semibold text-navy">Per method (precision / recall; F1 derived)</h2>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-ice">
            <tr>
              <th className="px-2 py-2">Method</th>
              <th className="px-2 py-2">Precision</th>
              <th className="px-2 py-2">Recall</th>
              <th className="px-2 py-2">F1 (derived)</th>
              <th className="px-2 py-2">n cases</th>
              <th className="px-2 py-2">Seed</th>
              <th className="px-2 py-2">Tag</th>
            </tr>
          </thead>
          <tbody>
            {data.methods.map((m) => (
              <tr key={m.method} className="border-t">
                <td className="px-2 py-2 font-medium">{m.method}</td>
                <td className="px-2 py-2">{m.precision.toFixed(2)}</td>
                <td className="px-2 py-2">{m.recall.toFixed(2)}</td>
                <td className="px-2 py-2">{f1(m.precision, m.recall).toFixed(2)}</td>
                <td className="px-2 py-2">{m.n_cases}</td>
                <td className="px-2 py-2">{m.seed}</td>
                <td className="px-2 py-2">
                  <AccuracyBlock
                    precision={m.precision}
                    recall={m.recall}
                    status={data.status}
                    seed={m.seed}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="rounded-xl bg-white p-5 shadow-card">
        <h2 className="mb-3 font-semibold text-navy">Literature priors (separate from local rates)</h2>
        {(priors ?? []).map((p) => (
          <div key={p.id} className="rounded-lg bg-ice p-4">
            <p className="font-medium text-navy">{p.method}</p>
            <AccuracyBlock
              precision={p.precision}
              recall={p.recall}
              status={data.status}
              seed={data.seed}
              literature
            />
          </div>
        ))}
      </section>
      <section className="rounded-xl bg-white p-5 shadow-card">
        <h2 className="mb-3 font-semibold text-navy">Scenario checklist</h2>
        <ul className="space-y-2">
          {data.scenarios.map((s) => (
            <li key={s.id} className="flex items-center justify-between rounded-lg bg-ice px-3 py-2">
              <span>{s.label}</span>
              <span className={s.result === "pass" ? "font-semibold text-high" : "font-semibold text-contested"}>
                {s.result.toUpperCase()}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
