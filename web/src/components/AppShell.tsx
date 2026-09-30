import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  BookOpen,
  Building2,
  Info,
  LayoutDashboard,
  Network,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { DISCLOSURE } from "../constants";
import { DemoChip } from "./Tags";
import { DisclosureBanner } from "./DisclosureBanner";
import { subscribeFallback } from "../api/client";
import { TourOverlay } from "../tour/TourOverlay";
import { useTour } from "../tour/TourContext";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/search", label: "Search", icon: Search },
  { to: "/actors", label: "Actors", icon: Users },
  { to: "/graph", label: "Network graph", icon: Network },
  { to: "/infrastructure", label: "Infrastructure", icon: Building2 },
  { to: "/validation", label: "Validation", icon: Shield },
  { to: "/sources", label: "Sources", icon: Activity },
  { to: "/about", label: "About", icon: Info },
];

export function AppShell() {
  const [fallback, setFallback] = useState(false);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const tour = useTour();

  useEffect(() => subscribeFallback(setFallback), []);
  useEffect(() => setOpen(false), [location.pathname]);

  const isPrint = location.pathname.startsWith("/print");
  if (isPrint) return <Outlet />;

  return (
    <div className="flex min-h-full bg-[#f7f9fc]">
      <aside
        className={`fixed z-40 flex h-full w-64 flex-col bg-navy text-white transition-transform md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"} md:static`}
      >
        <div className="border-b border-white/10 px-5 py-5">
          <p className="text-lg font-semibold leading-tight">Hopium · Attribution</p>
          <p className="mt-1 text-xs text-white/70">SIH26151 · investigative leads</p>
        </div>
        <nav className="flex-1 space-y-1 p-3" aria-label="Primary">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] ${isActive ? "bg-white/15 font-semibold" : "hover:bg-white/10"}`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <p className="px-5 py-4 text-xs text-white/50">Passive OSINT · no active attacks</p>
      </aside>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-2 py-1 text-sm md:hidden"
            aria-label="Open navigation"
            onClick={() => setOpen(true)}
          >
            Menu
          </button>
          <form
            className="flex min-w-0 flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/search?q=${encodeURIComponent(q)}`);
            }}
          >
            <label className="sr-only" htmlFor="global-search">
              Global search
            </label>
            <input
              id="global-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search handle, wallet, PGP, onion"
              className="w-full min-w-0 rounded-xl border border-slate-200 bg-ice px-3 py-2 text-[15px] text-navy"
            />
          </form>
          <DemoChip />
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-royal px-3 py-2 text-sm font-semibold text-white hover:bg-navy"
            onClick={tour.start}
          >
            <BookOpen className="h-4 w-4" aria-hidden />
            Guided tour
          </button>
        </header>
        {fallback ? (
          <div className="bg-exploratory px-4 py-1.5 text-sm text-white" role="status">
            API unreachable, showing demo data
          </div>
        ) : null}
        <DisclosureBanner text={DISCLOSURE} />
        <main className="min-w-0 flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <TourOverlay />
    </div>
  );
}
