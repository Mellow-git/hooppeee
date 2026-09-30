import { useEffect, useState } from "react";
import { TOUR_STEPS, useTour } from "./TourContext";

export function TourOverlay() {
  const { active, index, next, back, close } = useTour();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const step = TOUR_STEPS[index];

  useEffect(() => {
    if (!active || !step) return;
    let tries = 0;
    const tick = () => {
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el) {
        setRect(el.getBoundingClientRect());
        return;
      }
      tries += 1;
      if (tries < 20) window.setTimeout(tick, 80);
      else setRect(null);
    };
    const t = window.setTimeout(tick, 50);
    const onScroll = () => {
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el) setRect(el.getBoundingClientRect());
    };
    window.addEventListener("resize", onScroll);
    document.addEventListener("scroll", onScroll, true);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("scroll", onScroll, true);
    };
  }, [active, step]);

  if (!active || !step) return null;

  const pad = 8;
  const box = rect
    ? {
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }
    : null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-label="Guided tour">
      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            {box ? (
              <rect x={box.left} y={box.top} width={box.width} height={box.height} rx="12" fill="black" />
            ) : null}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(11,42,91,0.62)" mask="url(#tour-mask)" />
      </svg>
      {box ? (
        <div
          className="pointer-events-none absolute rounded-xl ring-4 ring-white"
          style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
        />
      ) : null}
      <div
        className="absolute w-[min(420px,calc(100%-2rem))] rounded-xl bg-white p-4 shadow-card"
        style={{
          top: box ? Math.min(box.top + box.height + 12, window.innerHeight - 220) : 80,
          left: box ? Math.min(Math.max(16, box.left), window.innerWidth - 440) : 16,
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-royal">
          Step {index + 1} of {TOUR_STEPS.length}
        </p>
        <h2 className="mt-1 text-lg font-semibold text-navy">{step.title}</h2>
        <p className="mt-2 text-sm text-slate-700">{step.talk}</p>
        <div className="mt-4 flex items-center justify-between">
          <button type="button" className="text-sm text-slate-600 hover:text-navy" onClick={close}>
            Skip
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm disabled:opacity-40"
              onClick={back}
              disabled={index === 0}
            >
              Back
            </button>
            <button
              type="button"
              className="rounded-lg bg-royal px-3 py-1.5 text-sm font-semibold text-white"
              onClick={next}
            >
              {index === TOUR_STEPS.length - 1 ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
