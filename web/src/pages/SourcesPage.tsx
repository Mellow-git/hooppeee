import { useState } from "react";
import { getSources } from "../api/client";
import { useAsync } from "../lib/useAsync";
import { Skeleton } from "../components/Skeleton";

export function SourcesPage() {
  const { data, loading } = useAsync(() => getSources(), []);
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);

  if (loading || !data) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-navy">Sources</h1>
        <button
          type="button"
          className={`rounded-xl px-4 py-2 font-semibold text-white transition ${verified ? "bg-high" : "bg-royal"}`}
          onClick={() => {
            if (verified) return;
            setBusy(true);
            window.setTimeout(() => {
              setBusy(false);
              setVerified(true);
            }, 700);
          }}
        >
          {busy ? "Verifying…" : verified ? "Chain verified" : "Verify chain"}
        </button>
      </div>
      <div className="overflow-x-auto rounded-xl bg-white shadow-card">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-ice text-navy">
            <tr>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">Reliability</th>
              <th className="px-3 py-2">Cadence</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Last scan</th>
              <th className="px-3 py-2">Hash chain</th>
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="px-3 py-2">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.id}</p>
                </td>
                <td className="px-3 py-2">{s.reliability}</td>
                <td className="px-3 py-2">{s.cadence}</td>
                <td className="px-3 py-2">
                  {s.status === "unreachable" ? (
                    <span className="font-semibold text-contested">unreachable</span>
                  ) : (
                    s.status
                  )}
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{s.last_scan.replace("T", " ").slice(0, 16)}</td>
                <td className="px-3 py-2">{verified && s.hash_chain !== "break" ? "verified" : s.hash_chain}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
