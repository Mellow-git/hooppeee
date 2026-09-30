import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import cytoscape from "cytoscape";
import { getGraph } from "../api/client";
import { useAsync } from "../lib/useAsync";
import { Skeleton } from "../components/Skeleton";
import type { GraphNode } from "../types";

const COLORS: Record<string, string> = {
  actor: "#0B2A5B",
  identifier: "#1F4FBF",
  infra: "#1B7F4B",
  persona: "#7c3aed",
  excluded_cluster: "#94a3b8",
};

const TIER_COLOR: Record<number, string> = {
  1: "#0B2A5B",
  2: "#1F4FBF",
  3: "#93c5fd",
};

export function GraphPage() {
  const { data, loading } = useAsync(() => getGraph("CLU-0001"), []);
  const host = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [showService, setShowService] = useState(true);
  const [types, setTypes] = useState({
    actor: true,
    identifier: true,
    infra: true,
    persona: true,
    excluded_cluster: true,
  });

  useEffect(() => {
    if (!data || !host.current) return;
    const visibleNodes = data.nodes.filter((n) => {
      if (n.type === "excluded_cluster" && !showService) return false;
      return types[n.type];
    });
    const ids = new Set(visibleNodes.map((n) => n.id));
    const visibleEdges = data.edges.filter((e) => ids.has(e.source) && ids.has(e.target));
    const cy = cytoscape({
      container: host.current,
      elements: [
        ...visibleNodes.map((n) => ({
          data: { ...n, label: n.label },
        })),
        ...visibleEdges.map((e) => ({
          data: { ...e, label: e.tier ? `T${e.tier}` : "" },
        })),
      ],
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            color: "#0B2A5B",
            "font-size": 10,
            "text-wrap": "wrap",
            "text-max-width": "90px",
            "background-color": "#1F4FBF",
            width: 36,
            height: 36,
          },
        },
        { selector: 'node[type = "actor"]', style: { "background-color": COLORS.actor, width: 48, height: 48 } },
        { selector: 'node[type = "identifier"]', style: { "background-color": COLORS.identifier, shape: "round-rectangle" } },
        { selector: 'node[type = "infra"]', style: { "background-color": COLORS.infra } },
        { selector: 'node[type = "persona"]', style: { "background-color": COLORS.persona } },
        {
          selector: 'node[type = "excluded_cluster"]',
          style: { "background-color": COLORS.excluded_cluster, width: 70, height: 70, "font-size": 9 },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-style": "dashed",
            "curve-style": "bezier",
            label: "data(label)",
            "font-size": 8,
            "target-arrow-shape": "triangle",
            "line-color": "#1F4FBF",
            "target-arrow-color": "#1F4FBF",
          },
        },
        { selector: "edge[tier = 1]", style: { "line-color": TIER_COLOR[1], "target-arrow-color": TIER_COLOR[1] } },
        { selector: "edge[tier = 2]", style: { "line-color": TIER_COLOR[2], "target-arrow-color": TIER_COLOR[2] } },
        { selector: "edge[tier = 3]", style: { "line-color": TIER_COLOR[3], "target-arrow-color": TIER_COLOR[3] } },
      ],
      layout: { name: "cose", animate: false, padding: 20 },
    });
    cy.on("tap", "node", (ev) => {
      const n = ev.target.data() as GraphNode;
      setSelected(n);
    });
    return () => {
      cy.destroy();
    };
  }, [data, showService, types]);

  if (loading || !data) return <Skeleton className="h-[480px]" />;

  const toggle = (k: keyof typeof types) => setTypes((t) => ({ ...t, [k]: !t[k] }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-navy">Network graph</h1>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(types) as (keyof typeof types)[]).map((k) => (
          <label key={k} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm shadow-sm">
            <input type="checkbox" checked={types[k]} onChange={() => toggle(k)} />
            {k.replace("_", " ")}
          </label>
        ))}
        <label className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm shadow-sm" data-tour="service-wallet">
          <input type="checkbox" checked={showService} onChange={() => setShowService((v) => !v)} />
          Service wallet suspected (1,240 addresses), excluded from linking
        </label>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-slate-600">
        <span>Legend:</span>
        <span className="inline-flex items-center gap-1"><i className="inline-block h-3 w-3 rounded-full bg-navy" /> Actor</span>
        <span className="inline-flex items-center gap-1"><i className="inline-block h-3 w-3 rounded-sm bg-royal" /> Identifier</span>
        <span className="inline-flex items-center gap-1"><i className="inline-block h-3 w-3 rounded-full bg-high" /> Infra</span>
        <span className="inline-flex items-center gap-1"><i className="inline-block h-3 w-3 rounded-full bg-violet-600" /> Persona</span>
        <span className="inline-flex items-center gap-1"><i className="inline-block h-3 w-3 rounded-full bg-slate-400" /> Excluded cluster</span>
        <span>Edges LINKED_TO dashed · colour by tier</span>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div ref={host} className="h-[520px] rounded-xl bg-white shadow-card" role="img" aria-label="Attribution graph" />
        <aside className="rounded-xl bg-white p-4 shadow-card">
          <h2 className="font-semibold text-navy">Selection</h2>
          {selected ? (
            <div className="mt-3 space-y-2 text-sm">
              <p className="font-medium">{selected.label}</p>
              <p className="capitalize text-slate-600">{selected.type}</p>
              {selected.detail ? <p>{selected.detail}</p> : null}
              {selected.actor_id ? (
                <Link className="font-semibold text-royal" to={`/actors/${selected.actor_id}`}>
                  Open actor {selected.actor_id}
                </Link>
              ) : null}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Click a node for details.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
