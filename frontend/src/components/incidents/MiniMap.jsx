import { useEffect } from "react";
import { Marker, useMap } from "react-leaflet";
import MapSurface from "../map/MapSurface.jsx";
import { incidentIcon } from "../map/mapUtils.jsx";

function Recenter({ position }) {
  const map = useMap();
  useEffect(() => { map.setView(position, map.getZoom(), { animate: false }); }, [map, position]);
  return null;
}

export default function MiniMap({ incident }) {
  const position = [incident.location.latitude, incident.location.longitude];
  return (
    <MapSurface center={position} zoom={16} scrollWheelZoom={false} className="mini-map">
      <Recenter position={position} />
      <Marker position={position} icon={incidentIcon(incident.status, incident.category, true)} keyboard={false} />
    </MapSurface>
  );
}
