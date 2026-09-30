import type { Band } from "../types";
import { bandLabel } from "../lib/band";

const styles: Record<Band, string> = {
  high: "bg-high text-white",
  moderate: "bg-royal text-white",
  exploratory: "bg-exploratory text-white",
  contested: "bg-contested text-white",
  none: "bg-slate-500 text-white",
};

export function BandBadge({
  value,
  large = false,
}: {
  value: Band;
  large?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-lg px-2.5 py-1 font-semibold tracking-wide ${styles[value]} ${large ? "text-lg px-4 py-2" : "text-xs"}`}
    >
      {bandLabel(value)}
    </span>
  );
}

export function TierChip({ tier }: { tier: 1 | 2 | 3 }) {
  const cls =
    tier === 1 ? "bg-navy text-white" : tier === 2 ? "bg-royal text-white" : "bg-ice text-navy border border-royal/30";
  return <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${cls}`}>T{tier}</span>;
}
