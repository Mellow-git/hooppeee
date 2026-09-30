import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { TourProvider } from "./tour/TourContext";
import { OverviewPage } from "./pages/OverviewPage";
import { SearchPage } from "./pages/SearchPage";
import { ActorsPage } from "./pages/ActorsPage";
import { ActorPage } from "./pages/ActorPage";
import { TimelinePage } from "./pages/TimelinePage";
import { InfrastructurePage } from "./pages/InfrastructurePage";
import { ValidationPage } from "./pages/ValidationPage";
import { SourcesPage } from "./pages/SourcesPage";
import { AboutPage } from "./pages/AboutPage";
import { PrintActorPage, PrintOverviewPage } from "./pages/PrintPages";
import { Skeleton } from "./components/Skeleton";

const GraphPage = lazy(() =>
  import("./pages/GraphPage").then((m) => ({ default: m.GraphPage })),
);

export default function App() {
  return (
    <TourProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/actors" element={<ActorsPage />} />
          <Route path="/actors/:id" element={<ActorPage />} />
          <Route
            path="/graph"
            element={
              <Suspense fallback={<Skeleton className="h-[480px]" />}>
                <GraphPage />
              </Suspense>
            }
          />
          <Route path="/clusters/:id" element={<Navigate to="/graph" replace />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/infrastructure" element={<InfrastructurePage />} />
          <Route path="/scan-metrics" element={<Navigate to="/infrastructure" replace />} />
          <Route path="/validation" element={<ValidationPage />} />
          <Route path="/sources" element={<SourcesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/print/overview" element={<PrintOverviewPage />} />
          <Route path="/print/actors/:id" element={<PrintActorPage />} />
        </Route>
      </Routes>
    </TourProvider>
  );
}
