import { Link } from "react-router-dom";
import { listActors } from "../api/client";
import { useAsync } from "../lib/useAsync";
import { band, corroboration } from "../lib/band";
import { BandBadge } from "../components/BandBadge";
import { Skeleton } from "../components/Skeleton";

export function ActorsPage() {
  const { data: actors, loading } = useAsync(() => listActors(), []);
  if (loading || !actors) return <Skeleton className="h-48" />;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-navy">Actors</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {actors.map((a) => (
          <Link key={a.id} to={`/actors/${a.id}`} className="rounded-xl bg-white p-5 shadow-card hover:ring-2 hover:ring-royal">
            <p className="text-sm text-royal">{a.id}</p>
            <div className="mt-1 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-navy">{a.display_name}</h2>
              <BandBadge value={band(a.ledger)} />
            </div>
            <p className="mt-2 text-sm text-slate-600">{a.category}</p>
            <p className="mt-2 text-sm text-navy">
              Corroborated by {corroboration(a.ledger)} independent evidence classes
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
