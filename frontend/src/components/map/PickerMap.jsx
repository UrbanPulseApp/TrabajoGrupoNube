import { useEffect, useMemo } from "react";
import { Marker, Tooltip, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import MapSurface from "./MapSurface.jsx";
import { incidentIcon } from "./mapUtils.jsx";

const pickerIcon = L.divIcon({
  className: "up-pin-wrap",
  html: '<div class="picker-pin"><span></span></div>',
  iconSize: [44, 54],
  iconAnchor: [22, 52],
});

function ClickToPlace({ enabled, onPick }) {
  useMapEvents({ click(event) { if (enabled) onPick({ latitude: event.latlng.lat, longitude: event.latlng.lng }); } });
  return null;
}

function FollowPosition({ position }) {
  const map = useMap();
  useEffect(() => { if (position) map.flyTo(position, Math.max(map.getZoom(), 16), { duration: 0.5 }); }, [map, position]);
  return null;
}

/** Mapa para situar un aviso: clic para colocar el marcador y arrastre para afinar. */
export default function PickerMap({ location, onPick, enabled = true, nearby = [], mapRef }) {
  const position = useMemo(() => (location ? [location.latitude, location.longitude] : null), [location]);
  return (
    <MapSurface mapRef={mapRef} zoom={14} className={enabled ? "is-picking" : ""}>
      <ClickToPlace enabled={enabled} onPick={onPick} />
      <FollowPosition position={position} />
      {nearby.map((incident) => (
        <Marker key={incident.id} position={[incident.location.latitude, incident.location.longitude]} icon={incidentIcon(incident.status, incident.category)} opacity={0.85}>
          <Tooltip direction="top" offset={[0, -44]}>{incident.title}</Tooltip>
        </Marker>
      ))}
      {position && (
        <Marker
          position={position}
          icon={pickerIcon}
          draggable={enabled}
          zIndexOffset={1000}
          eventHandlers={{ dragend(event) { const point = event.target.getLatLng(); onPick({ latitude: point.lat, longitude: point.lng }); } }}
        />
      )}
    </MapSurface>
  );
}
