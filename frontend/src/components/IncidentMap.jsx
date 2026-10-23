import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const malaga = [36.7213, -4.4214];

const incidentIcon = L.divIcon({
  className: "incident-map-marker",
  html: '<span class="marker-pulse"></span><span class="marker-core"></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function MapClickHandler({ onLocationSelected, setPosition }) {
  useMapEvents({
    click(event) {
      const next = { latitude: event.latlng.lat, longitude: event.latlng.lng };
      setPosition([next.latitude, next.longitude]);
      onLocationSelected(next);
    },
  });
  return null;
}

function MapCenterOnPosition({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, Math.max(map.getZoom(), 15), { animate: true });
  }, [map, position]);
  return null;
}

export default function IncidentMap({ latitude, longitude, onLocationSelected }) {
  const [position, setPosition] = useState(
    latitude != null && longitude != null ? [latitude, longitude] : null,
  );

  useEffect(() => {
    if (latitude != null && longitude != null) setPosition([latitude, longitude]);
  }, [latitude, longitude]);

  return (
    <div className="map-frame">
      <MapContainer center={malaga} zoom={13} scrollWheelZoom className="incident-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapCenterOnPosition position={position} />
        <MapClickHandler onLocationSelected={onLocationSelected} setPosition={setPosition} />
        {position && <Marker position={position} icon={incidentIcon} />}
      </MapContainer>
      {!position && <div className="map-hint"><span className="map-hint-target">⌖</span><span>Haz clic en el mapa para indicar el lugar</span></div>}
      {position && <div className="map-coordinates">{position[0].toFixed(5)}° N&nbsp; · &nbsp;{Math.abs(position[1]).toFixed(5)}° O</div>}
      <div className="map-label"><span className="map-label-dot" /> MÁLAGA, ESPAÑA</div>
    </div>
  );
}
