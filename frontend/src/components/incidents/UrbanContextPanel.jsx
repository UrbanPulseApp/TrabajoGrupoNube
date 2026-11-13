import { Building2, CloudSun, MapPinned, TrafficCone } from "lucide-react";

const ASSET_LABEL = { TRAFFIC_LIGHT: "Semáforo", BUS_STOP: "Parada de autobús", STREET_LIGHT: "Farola", CONTAINER: "Contenedor", FOUNTAIN: "Fuente" };
const assetLabel = (type) => ASSET_LABEL[type] || String(type || "Activo").replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase());

export default function UrbanContextPanel({ context }) {
  const assets = context.nearbyAssets || [];
  return (
    <div className="context-grid">
      <div className="context-card">
        <Building2 aria-hidden="true" />
        <div><small>Distrito y barrio</small><strong>{context.district || "Distrito sin identificar"}</strong><span>{context.neighborhood || "Zona urbana"}</span>{context.address && <span className="context-address">{context.address}</span>}</div>
      </div>
      <div className="context-card">
        <CloudSun aria-hidden="true" />
        <div><small>Tiempo al registrarse</small><strong>{context.weatherSummary || "Sin datos"}</strong></div>
      </div>
      <div className="context-card">
        <TrafficCone aria-hidden="true" />
        <div><small>Tráfico</small><strong>{context.trafficStatus || "Sin datos"}</strong></div>
      </div>
      <div className="context-card context-assets">
        <MapPinned aria-hidden="true" />
        <div>
          <small>Elementos urbanos a menos de 100 m</small>
          {assets.length === 0 ? <span>No hay elementos registrados cerca.</span> : (
            <ul>{assets.map((asset) => <li key={asset.id}><strong>{assetLabel(asset.type)}</strong><span>{asset.metadata && asset.metadata !== asset.id ? asset.metadata : asset.id}</span><b className="tabular">{asset.distanceMeters} m</b></li>)}</ul>
          )}
        </div>
      </div>
    </div>
  );
}
