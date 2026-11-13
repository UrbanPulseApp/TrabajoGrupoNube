import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MALAGA_CENTER } from "../../lib/incidentMeta.js";
import { TILE_ATTRIBUTION, TILE_URL } from "./mapUtils.jsx";
import "./map.css";

/** Contenedor de mapa con el estilo de la app (incluye modo oscuro vía CSS). */
export default function MapSurface({ children, mapRef, center = MALAGA_CENTER, zoom = 13, className = "", onClick, ...rest }) {
  return (
    <MapContainer
      ref={mapRef}
      center={center}
      zoom={zoom}
      zoomControl={false}
      scrollWheelZoom
      preferCanvas
      className={`map-surface ${className}`}
      {...rest}
    >
      <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} maxZoom={19} />
      <ZoomControl position="topright" zoomInTitle="Acercar" zoomOutTitle="Alejar" />
      {children}
    </MapContainer>
  );
}
