import { f1 } from "../lib/f1";
import type { ValidationStatus } from "../types";
import { IllustrativeTag, LiteratureTag, MeasuredTag } from "./Tags";

export function AccuracyBlock({
  precision,
  recall,
  status,
  seed,
  literature = false,
}: {
  precision: number;
  recall: number;
  status: ValidationStatus;
  seed: number;
  literature?: boolean;
}) {
  const derived = f1(precision, recall);
  return (
    <div className="space-y-1">
      <p className="tabular-nums text-slate-800">
        P {precision.toFixed(2)} · R {recall.toFixed(2)} · F1 {derived.toFixed(2)}{" "}
        <span className="text-xs text-slate-500">(derived)</span>
      </p>
      {literature ? <LiteratureTag /> : <IllustrativeTag status={status} />}
      <MeasuredTag seed={seed} status={status} />
    </div>
  );
}
