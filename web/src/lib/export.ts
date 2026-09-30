import { DISCLOSURE } from "../constants";
import type { Actor } from "../types";

export function downloadText(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function actorJson(actor: Actor): string {
  return JSON.stringify({ disclosure: DISCLOSURE, actor, ledger: actor.ledger }, null, 2);
}

export function actorCsv(actor: Actor): string {
  const header = `# ${DISCLOSURE}`;
  const cols = [
    "entry_id",
    "evidence_type",
    "tier",
    "polarity",
    "independence_class",
    "source",
    "reliability",
    "captured_at",
    "record_id",
    "content_sha256",
    "chain_hash",
  ];
  const lines = actor.ledger.map((r) =>
    [
      r.entry_id,
      r.evidence_type,
      r.tier,
      r.polarity,
      r.independence_class,
      r.source.name,
      r.source.reliability,
      r.captured_at,
      r.record_id,
      r.content_sha256,
      r.chain_hash,
    ]
      .map((c) => `"${String(c).replaceAll('"', '""')}"`)
      .join(","),
  );
  return [header, cols.join(","), ...lines].join("\n");
}

export function overviewJson(actors: Actor[]): string {
  return JSON.stringify(
    {
      disclosure: DISCLOSURE,
      actors: actors.map((a) => ({ id: a.id, display_name: a.display_name, ledger: a.ledger })),
    },
    null,
    2,
  );
}

export function overviewCsv(actors: Actor[]): string {
  const header = `# ${DISCLOSURE}`;
  const cols = ["actor_id", "display_name", "entry_id", "evidence_type", "tier", "polarity"];
  const lines: string[] = [];
  for (const a of actors) {
    for (const r of a.ledger) {
      lines.push(
        [a.id, a.display_name, r.entry_id, r.evidence_type, r.tier, r.polarity]
          .map((c) => `"${String(c).replaceAll('"', '""')}"`)
          .join(","),
      );
    }
  }
  return [header, cols.join(","), ...lines].join("\n");
}
