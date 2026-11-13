import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell.jsx";
import ExplorePage from "./pages/ExplorePage.jsx";

// El mapa es la portada y se carga siempre; el resto de ventanas, bajo demanda.
const IncidentDetailPage = lazy(() => import("./pages/IncidentDetailPage.jsx"));
const ReportPage = lazy(() => import("./pages/ReportPage.jsx"));
const HistoricPage = lazy(() => import("./pages/HistoricPage.jsx"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));

function PageFallback() {
  return <div className="page" aria-busy="true"><span className="skeleton" style={{ display: "block", height: 240, borderRadius: 16 }} /></div>;
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppShell />}>
          <Route index element={<ExplorePage />} />
          <Route path="incidencias/:id" element={<IncidentDetailPage />} />
          <Route path="reportar" element={<ReportPage />} />
          <Route path="historico" element={<HistoricPage />} />
          <Route path="analitica" element={<AnalyticsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
