import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export interface TourStep {
  id: string;
  path: string;
  target: string;
  title: string;
  talk: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "overview",
    path: "/",
    target: "needs-review",
    title: "What needs review",
    talk: "Start here: contested leads are listed first so an analyst does not miss a contradiction.",
  },
  {
    id: "search",
    path: "/search?q=%D1%95hadowl3dger&demo=1",
    target: "search-homoglyph",
    title: "Homoglyph handle search",
    talk: "Try the Cyrillic ѕ handle: skeleton normalisation still finds ShadowLedger.",
  },
  {
    id: "shadow",
    path: "/actors/ACT-0417",
    target: "ledger-high",
    title: "ShadowLedger ledger",
    talk: "HIGH is the strongest supporting tier, shown beside a corroboration count that is not a probability.",
  },
  {
    id: "neon",
    path: "/actors/ACT-0233",
    target: "contradict-row",
    title: "NeonPharm contested",
    talk: "A Tier-2 PGP contradiction matching the top supporting tier forces CONTESTED.",
  },
  {
    id: "graph",
    path: "/graph",
    target: "service-wallet",
    title: "Service-wallet exclusion",
    talk: "The 1,240-address service cluster stays collapsed and is excluded from linking.",
  },
  {
    id: "infra",
    path: "/infrastructure",
    target: "funnel",
    title: "Infrastructure funnel",
    talk: "Matches collapse at prevalence, ASN, and two-class gates; only three are confirmed.",
  },
  {
    id: "validation",
    path: "/validation",
    target: "illustrative-tag",
    title: "Honesty on numbers",
    talk: "Accuracy figures are tagged ILLUSTRATIVE so the jury never mistakes placeholders for measured performance.",
  },
];

interface TourState {
  active: boolean;
  index: number;
  start: () => void;
  next: () => void;
  back: () => void;
  close: () => void;
}

const TourContext = createContext<TourState | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const go = useCallback(
    (i: number) => {
      const step = TOUR_STEPS[i];
      if (!step) return;
      setIndex(i);
      if (location.pathname + location.search !== step.path && location.pathname !== step.path.split("?")[0]) {
        navigate(step.path);
      } else if (`${location.pathname}${location.search}` !== step.path) {
        navigate(step.path);
      }
    },
    [location.pathname, location.search, navigate],
  );

  const start = useCallback(() => {
    setActive(true);
    setIndex(0);
    navigate(TOUR_STEPS[0].path);
  }, [navigate]);

  const close = useCallback(() => setActive(false), []);

  const next = useCallback(() => {
    if (index >= TOUR_STEPS.length - 1) {
      setActive(false);
      return;
    }
    go(index + 1);
  }, [go, index]);

  const back = useCallback(() => {
    if (index <= 0) return;
    go(index - 1);
  }, [go, index]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") back();
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, back, close, next]);

  const value = useMemo(
    () => ({ active, index, start, next, back, close }),
    [active, index, start, next, back, close],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour outside provider");
  return ctx;
}
