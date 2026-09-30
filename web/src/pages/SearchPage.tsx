import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { detectQueryType, searchActors } from "../api/client";
import { HOMoglyph_DEMO } from "../constants";
import { band } from "../lib/band";
import { BandBadge } from "../components/BandBadge";
import { EmptyState, Skeleton } from "../components/Skeleton";
import type { SearchHit } from "../types";

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [loading, setLoading] = useState(false);
  const type = useMemo(() => detectQueryType(q), [q]);

  useEffect(() => {
    setQ(params.get("q") ?? "");
  }, [params]);

  useEffect(() => {
    const query = params.get("q");
    if (!query) {
      setHits(null);
      return;
    }
    setLoading(true);
    void searchActors(query).then((res) => {
      setHits(res);
      setLoading(false);
    });
  }, [params]);

  const run = (value: string) => {
    setParams({ q: value, demo: params.get("demo") ?? "" });
  };

  return (
    <div className="space-y-5" data-tour="search-homoglyph">
      <h1 className="text-2xl font-semibold text-navy">Search</h1>
      <form
        className="rounded-xl bg-white p-5 shadow-card"
        onSubmit={(e) => {
          e.preventDefault();
          run(q);
        }}
      >
        <label htmlFor="search-q" className="text-sm font-medium text-navy">
          Query
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            id="search-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="min-w-[220px] flex-1 rounded-xl border border-slate-200 bg-ice px-3 py-2"
            placeholder="Handle, wallet, PGP fingerprint, or onion"
          />
          <span className="self-center rounded-full bg-ice px-3 py-1 text-xs font-semibold uppercase text-royal">
            {type}
          </span>
          <button type="submit" className="rounded-xl bg-royal px-4 py-2 font-semibold text-white">
            Search
          </button>
        </div>
        <button
          type="button"
          className="mt-3 text-sm font-semibold text-royal"
          onClick={() => {
            setQ(HOMoglyph_DEMO);
            setParams({ q: HOMoglyph_DEMO, demo: "1" });
          }}
        >
          Try: {HOMoglyph_DEMO}
        </button>
      </form>
      {loading ? <Skeleton className="h-32" /> : null}
      {!loading && hits && hits.length === 0 ? (
        <EmptyState title="No matches" body="Nothing in the demo set matched that query." />
      ) : null}
      <div className="grid gap-3">
        {hits?.map((hit) => (
          <Link
            key={hit.actor.id + hit.matched_on}
            to={`/actors/${hit.actor.id}`}
            className="rounded-xl bg-white p-4 shadow-card hover:ring-2 hover:ring-royal"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-royal">{hit.actor.id}</p>
                <p className="text-lg font-semibold text-navy">{hit.actor.display_name}</p>
                <p className="text-sm text-slate-600">Matched on {hit.matched_on}</p>
              </div>
              <BandBadge value={band(hit.actor.ledger)} />
            </div>
            {hit.confusable_match ? (
              <p className="mt-3 rounded-lg bg-amber-50 p-2 text-sm text-navy">
                Matched via confusable-character normalisation (Cyrillic ѕ treated as Latin s)
              </p>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
