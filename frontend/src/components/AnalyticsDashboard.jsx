import { useEffect, useState } from "react";
import { getAnalyticsSummary } from "../services/IncidentService.js";
import "./AnalyticsDashboard.css";

const statusTranslations = {
  REPORTED: "Recibida",
  VALIDATED: "Validada",
  ASSIGNED: "Asignada",
  IN_PROGRESS: "En curso",
  RESOLVED: "Resuelta",
  CLOSED: "Cerrada",
  REJECTED: "Rechazada",
  REOPENED: "Reabierta",
};

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const summary = await getAnalyticsSummary();
      setData(summary);
    } catch (err) {
      setError(err.message || "No se pudieron cargar los indicadores.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="analytics-section" id="analitica">
      <div className="analytics-header">
        <div>
          <span className="section-kicker">CUADRO DE MANDO MUNICIPAL</span>
          <h2>Indicadores y analítica territorial</h2>
        </div>
        <button type="button" className="refresh-button" onClick={fetchData} disabled={loading}>
          {loading ? "Actualizando…" : "↻ Actualizar métricas"}
        </button>
      </div>

      {error && (
        <div className="analytics-error" role="alert">
          <strong>No se pudieron cargar las métricas.</strong>
          <span>{error}</span>
        </div>
      )}

      {loading && !data && <div className="analytics-loading">Calculando indicadores territoriales…</div>}

      {data && (
        <div className="analytics-content">
          {/* Tarjetas KPI */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-label">Total Incidencias</span>
              <strong className="kpi-value">{data.totalIncidents}</strong>
              <small className="kpi-sub">Registradas en la plataforma</small>
            </div>
            <div className="kpi-card kpi-active">
              <span className="kpi-label">Activas en Gestión</span>
              <strong className="kpi-value">{data.activeIncidents}</strong>
              <small className="kpi-sub">En curso o asignadas</small>
            </div>
            <div className="kpi-card kpi-resolved">
              <span className="kpi-label">Resueltas</span>
              <strong className="kpi-value">{data.resolvedIncidents}</strong>
              <small className="kpi-sub">Trabajos finalizados</small>
            </div>
            <div className="kpi-card kpi-closed">
              <span className="kpi-label">Cerradas</span>
              <strong className="kpi-value">{data.closedIncidents}</strong>
              <small className="kpi-sub">Validadas y archivadas</small>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Últimos 7 días</span>
              <strong className="kpi-value">{data.incidentsLast7Days}</strong>
              <small className="kpi-sub">Nuevos avisos</small>
            </div>
            <div className="kpi-card">
              <span className="kpi-label">Últimos 30 días</span>
              <strong className="kpi-value">{data.incidentsLast30Days}</strong>
              <small className="kpi-sub">Tendencia mensual</small>
            </div>
          </div>

          <div className="charts-grid">
            {/* Desglose por Estado */}
            <div className="chart-card">
              <h3>Distribución por Estado</h3>
              <div className="bars-list">
                {Object.entries(data.byStatus || {}).map(([status, count]) => {
                  const percentage = data.totalIncidents > 0 ? Math.round((count / data.totalIncidents) * 100) : 0;
                  return (
                    <div key={status} className="bar-row">
                      <div className="bar-labels">
                        <span>{statusTranslations[status] || status}</span>
                        <b>{count} ({percentage}%)</b>
                      </div>
                      <div className="progress-track">
                        <div className={`progress-fill fill-${status.toLowerCase()}`} style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desglose por Categoría */}
            <div className="chart-card">
              <h3>Incidencias por Categoría</h3>
              <div className="bars-list">
                {Object.entries(data.byCategory || {}).map(([cat, count]) => {
                  const percentage = data.totalIncidents > 0 ? Math.round((count / data.totalIncidents) * 100) : 0;
                  return (
                    <div key={cat} className="bar-row">
                      <div className="bar-labels">
                        <span>{cat}</span>
                        <b>{count} ({percentage}%)</b>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill fill-category" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Distribución por Distrito */}
            <div className="chart-card full-width">
              <h3>Impacto Territorial por Distrito (Málaga)</h3>
              {Object.keys(data.byDistrict || {}).length === 0 ? (
                <p className="empty-sub">Aún no hay suficientes incidencias georreferenciadas con distrito.</p>
              ) : (
                <div className="district-badges">
                  {Object.entries(data.byDistrict || {}).map(([district, count]) => (
                    <div key={district} className="district-card">
                      <span className="district-name">{district}</span>
                      <strong className="district-count">{count} avisos</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
