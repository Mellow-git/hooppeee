import type { ReactNode } from "react";
import { DISCLOSURE } from "../constants";
import { listActors, getActor } from "../api/client";
import { useAsync } from "../lib/useAsync";
import { band, corroboration } from "../lib/band";
import { DemoChip } from "../components/Tags";
import { BandBadge } from "../components/BandBadge";
import { useParams } from "react-router-dom";

function PrintChrome({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-white p-8 print-body">
      <div className="print-disclosure no-print-never sticky top-0 z-10 border-b-2 border-navy bg-white py-3">
        <p className="text-sm font-medium text-navy">{DISCLOSURE}</p>
        <div className="mt-1">
          <DemoChip />
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

export function PrintOverviewPage() {
  const { data: actors } = useAsync(() => listActors(), []);
  return (
    <PrintChrome>
      <h1 className="text-2xl font-semibold text-navy">Overview report</h1>
      <ul className="mt-4 space-y-2">
        {(actors ?? []).map((a) => (
          <li key={a.id} className="flex items-center justify-between border-b py-2">
            <span>
              {a.id} {a.display_name}
            </span>
            <BandBadge value={band(a.ledger)} />
          </li>
        ))}
      </ul>
    </PrintChrome>
  );
}

export function PrintActorPage() {
  const { id = "" } = useParams();
  const { data: actor } = useAsync(() => getActor(id), [id]);
  if (!actor) return <PrintChrome>Loading…</PrintChrome>;
  const b = band(actor.ledger);
  return (
    <PrintChrome>
      <h1 className="text-2xl font-semibold text-navy">
        {actor.id} {actor.display_name}
      </h1>
      <div className="mt-3 flex items-center gap-3">
        <BandBadge value={b} large />
        <p>Corroborated by {corroboration(actor.ledger)} independent evidence classes</p>
      </div>
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr>
            <th>Tier</th>
            <th>Type</th>
            <th>Class</th>
            <th>Polarity</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {actor.ledger.map((r) => (
            <tr key={r.entry_id} className="border-t">
              <td>T{r.tier}</td>
              <td>{r.evidence_type}</td>
              <td>{r.independence_class}</td>
              <td>{r.polarity}</td>
              <td>
                {r.source.name} {r.source.reliability}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PrintChrome>
  );
}
