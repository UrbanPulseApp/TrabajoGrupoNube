import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, CalendarDays, CalendarRange, CircleCheck, Inbox, Lock, RefreshCw, ShieldAlert, TriangleAlert } from "lucide-react";
import { getAnalyticsSummary } from "../services/IncidentService.js";
import { STATUSES, STATUS_LABEL, categoryLabel } from "../lib/incidentMeta.js";
import useDocumentTitle from "../lib/useDocumentTitle.js";
import { useAuth } from "../context/AuthContext.jsx";
import StateBox from "../components/ui/StateBox.jsx";
import "./AnalyticsPage.css";

function Donut({ entries, total }) {
  let offset = 25;
  return (
    <svg viewBox="0 0 42 42" className="donut" role="img" aria-label={`Distribución por estado de ${total} incidencias`}>
      <circle cx="21" cy="21" r="15.915" fill="none" stroke="var(--sunken)" strokeWidth="5" />
      {total > 0 && entries.map(([status, count]) => {
        const share = (count / total) * 100;
        const segment = <circle key={status} cx="21" cy="21" r="15.915" fill="none" stroke={`var(--st-${status.toLowerCase()})`} strokeWidth="5" strokeDasharray={`${Math.max(share - 0.6, 0.2)} ${100 - Math.max(share - 0.6, 0.2)}`} strokeDashoffset={offset} />;
        offset -= share;
        return segment;
      })}
      <text x="21" y="20.5" textAnchor="middle" className="donut-total">{total}</text>
      <text x="21" y="25.5" textAnchor="middle" className="donut-caption">avisos</text>
    </svg>
  );
}

function Bars({ entries, total, label }) {
  const max = Math.max(...entries.map(([, count]) => count), 1);
  return (
    <ul className="bar-list">
      {entries.map(([name, count]) => (
        <li key={name}>
          <span className="bar-name">{label(name)}</span>
          <span className="bar-track"><span className="bar-fill" style={{ width: `${(count / max) * 100}%` }} /></span>
          <b className="tabular">{count}</b>
          <small className="tabular">{total > 0 ? Math.round((count / total) * 100) : 0}%</small>
        </li>
      ))}
    </ul>
  );
}

export default function AnalyticsPage() {
  useDocumentTitle("Analítica");
  const { loading: authLoading, canAnalytics } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try { setData(await getAnalyticsSummary()); } catch (loadError) { setError(loadError.message || "No se pudieron cargar los indicadores."); } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (canAnalytics) load(); }, [canAnalytics, load]);

  if (authLoading) return <div className="page"><span className="skeleton" style={{ display: "block", height: 300, borderRadius: 16 }} /></div>;
  if (!canAnalytics) {
    return (
      <div className="page page-narrow"><div className="panel">
        <StateBox icon={ShieldAlert} title="Sección para el equipo municipal" action={<Link className="btn btn-outline" to="/">Volver al mapa</Link>}>
          La analítica está disponible para operadores, analistas y administradores.
        </StateBox>
      </div></div>
    );
  }

  const total = data?.totalIncidents || 0;
  const statusEntries = data ? STATUSES.map(([value]) => [value, data.byStatus?.[value] || 0]).filter(([, count]) => count > 0) : [];
  const categoryEntries = data ? Object.entries(data.byCategory || {}).sort((a, b) => b[1] - a[1]) : [];
  const districtEntries = data ? Object.entries(data.byDistrict || {}).sort((a, b) => b[1] - a[1]) : [];
  const kpis = data ? [
    [Inbox, "Total de avisos", data.totalIncidents, "Registrados en UrbanPulse"],
    [Activity, "En gestión", data.activeIncidents, "Asignados o en curso"],
    [CircleCheck, "Resueltos", data.resolvedIncidents, "Pendientes de cierre"],
    [Lock, "Cerrados", data.closedIncidents, "Finalizados"],
    [CalendarDays, "Últimos 7 días", data.incidentsLast7Days, "Avisos nuevos"],
    [CalendarRange, "Últimos 30 días", data.incidentsLast30Days, "Avisos nuevos"],
  ] : [];

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Analítica territorial</h1><p>Cómo evolucionan los avisos de la ciudad, por estado, categoría y distrito.</p></div>
        <button type="button" className="btn btn-outline" onClick={load} disabled={loading}><RefreshCw size={16} className={loading ? "spin" : ""} aria-hidden="true" /> Actualizar</button>
      </div>

      {error && <div className="alert" role="alert"><TriangleAlert aria-hidden="true" /><div><strong>No se pudieron cargar los indicadores</strong><p>{error}</p></div></div>}
      {loading && !data && <div className="kpi-grid">{[0, 1, 2, 3, 4, 5].map((key) => <span key={key} className="skeleton" style={{ height: 112, borderRadius: 16 }} />)}</div>}

      {data && (
        <>
          <ul className="kpi-grid">
            {kpis.map(([Icon, label, value, hint]) => (
              <li key={label} className="kpi">
                <span className="kpi-label"><Icon size={16} aria-hidden="true" /> {label}</span>
                <strong className="kpi-value tabular">{Number(value || 0).toLocaleString("es-ES")}</strong>
                <small>{hint}</small>
              </li>
            ))}
          </ul>

          <div className="charts">
            <section className="panel">
              <h2 className="panel-title">Por estado</h2>
              {statusEntries.length === 0 ? <p className="field-hint">Todavía no hay avisos.</p> : (
                <div className="donut-wrap">
                  <Donut entries={statusEntries} total={total} />
                  <ul className="donut-legend">
                    {statusEntries.map(([status, count]) => (
                      <li key={status} className={`status-${status.toLowerCase()}`}><span className="legend-dot" /><span>{STATUS_LABEL[status]}</span><b className="tabular">{count}</b></li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
            <section className="panel">
              <h2 className="panel-title">Por categoría</h2>
              {categoryEntries.length === 0 ? <p className="field-hint">Todavía no hay avisos.</p> : <Bars entries={categoryEntries} total={total} label={categoryLabel} />}
            </section>
            <section className="panel charts-wide">
              <h2 className="panel-title">Por distrito</h2>
              {districtEntries.length === 0 ? <p className="field-hint">Aún no hay avisos con distrito identificado.</p> : <Bars entries={districtEntries} total={total} label={(name) => name} />}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
