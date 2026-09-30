import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getTimeline, listActors } from "../api/client";
import { useAsync } from "../lib/useAsync";
import { Skeleton } from "../components/Skeleton";
import type { TimelineEvent } from "../types";

const KINDS: Record<TimelineEvent["kind"], string> = {
  post: "#1F4FBF",
  handle_change: "#0B2A5B",
  rebrand: "#C62828",
  wallet: "#1B7F4B",
};

export function TimelinePage() {
  const [params, setParams] = useSearchParams();
  const actorId = params.get("actor") ?? "ACT-0417";
  const { data: actors } = useAsync(() => listActors(), []);
  const { data: events, loading } = useAsync(() => getTimeline(actorId), [actorId]);
  const [from, setFrom] = useState("2023-01-01");
  const [to, setTo] = useState("2026-12-31");

  const filtered = useMemo(() => {
    return (events ?? []).filter((e) => {
      const day = e.at.slice(0, 10);
      return day >= from && day <= to;
    });
  }, [events, from, to]);

  const sources = [...new Set(filtered.map((e) => e.source_name))];
  const dates = filtered.map((e) => new Date(e.at).getTime());
  const min = dates.length ? Math.min(...dates) : 0;
  const max = dates.length ? Math.max(...dates) : 1;
  const span = Math.max(max - min, 1);

  if (loading || !events) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-navy">Timeline</h1>
      <div className="flex flex-wrap gap-3 rounded-xl bg-white p-4 shadow-card">
        <label className="text-sm">
          Actor{" "}
          <select
            className="rounded-md border px-2 py-1"
            value={actorId}
            onChange={(e) => setParams({ actor: e.target.value })}
          >
            {(actors ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.id} {a.display_name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          From <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-md border px-2 py-1" />
        </label>
        <label className="text-sm">
          To <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-md border px-2 py-1" />
        </label>
      </div>
      <div className="overflow-x-auto rounded-xl bg-white p-4 shadow-card">
        <svg viewBox={`0 0 900 ${80 + sources.length * 72}`} className="min-w-[720px] w-full" role="img" aria-label="Source swimlanes">
          {sources.map((src, i) => {
            const y = 40 + i * 72;
            const lane = filtered.filter((e) => e.source_name === src);
            return (
              <g key={src}>
                <text x="8" y={y + 4} fontSize="12" fill="#0B2A5B">
                  {src}
                </text>
                <line x1="140" y1={y} x2="880" y2={y} stroke="#E8EFFC" strokeWidth="8" />
                {lane.map((e) => {
                  const x = 140 + ((new Date(e.at).getTime() - min) / span) * 720;
                  return (
                    <g key={e.id}>
                      <circle cx={x} cy={y} r={e.kind === "rebrand" ? 10 : 7} fill={KINDS[e.kind]} />
                      <text x={x} y={y + 22} fontSize="9" fill="#334155" textAnchor="middle">
                        {e.at.slice(0, 7)}
                      </text>
                      <title>{`${e.label} (${e.kind})`}</title>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
        <ul className="mt-4 space-y-1 text-sm text-slate-700">
          {filtered.map((e) => (
            <li key={e.id}>
              <span className="font-medium text-navy">{e.at}</span> · {e.source_name} · {e.kind} · {e.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
