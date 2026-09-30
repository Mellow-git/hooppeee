import type { ValidationStatus } from "../types";

export function IllustrativeTag({ status }: { status: ValidationStatus }) {
  if (status !== "illustrative_placeholder") return null;
  return (
    <span className="inline-flex rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-exploratory">
      ILLUSTRATIVE: synthetic values, not measured
    </span>
  );
}

export function MeasuredTag({ seed, status }: { seed: number; status: ValidationStatus }) {
  if (status !== "measured") return null;
  return <span className="text-xs font-medium text-high">Measured locally, seed {seed}</span>;
}

export function LiteratureTag() {
  return (
    <span className="inline-flex rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-exploratory">
      Literature prior, different dataset, unverified PLACEHOLDER
    </span>
  );
}

export function DemoChip() {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-exploratory whitespace-nowrap">
      SYNTHETIC DEMO DATA
    </span>
  );
}
