import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { bucketByGrid, clusterIcon, incidentIcon, zoomToBucket } from "./mapUtils.jsx";
import { STATUS_LABEL, categoryLabel } from "../../lib/incidentMeta.js";

const getLatLng = (incident) => [incident.latitude, incident.longitude];

/** Incidencias de UrbanPulse sobre el mapa. Pulsar un marcador la selecciona. */
export default function IncidentMarkersLayer({ incidents, selectedId, onSelect }) {
  const map = useMap();

  useEffect(() => {
    const layer = L.layerGroup().addTo(map);
    let frame = null;

    const render = () => {
      frame = null;
      layer.clearLayers();
      const buckets = bucketByGrid(map, incidents, getLatLng, { cellSize: 64, skip: (item) => item.id === selectedId });
      buckets.forEach((bucket) => {
        if (bucket.items.length > 1) {
          L.marker(bucket.center, { icon: clusterIcon(bucket.items.length), keyboard: true, title: `${bucket.items.length} incidencias. Pulsa para acercar.` })
            .on("click", () => zoomToBucket(map, bucket, getLatLng))
            .addTo(layer);
          return;
        }
        const incident = bucket.items[0];
        const selected = incident.id === selectedId;
        const label = `${incident.title}. ${STATUS_LABEL[incident.status] || incident.status}. ${categoryLabel(incident.category)}`;
        const marker = L.marker(bucket.center, {
          icon: incidentIcon(incident.status, incident.category, selected),
          zIndexOffset: selected ? 1000 : 0,
          keyboard: true,
          title: label,
          riseOnHover: true,
        });
        marker.on("add", () => {
          const element = marker.getElement();
          element?.setAttribute("role", "button");
          element?.setAttribute("aria-label", label);
        });
        marker.on("click", (event) => { L.DomEvent.stopPropagation(event); onSelect(incident.id); });
        marker.addTo(layer);
      });
    };

    const schedule = () => { if (frame === null) frame = window.requestAnimationFrame(render); };
    render();
    map.on("moveend zoomend", schedule);
    return () => {
      map.off("moveend zoomend", schedule);
      if (frame !== null) window.cancelAnimationFrame(frame);
      map.removeLayer(layer);
    };
  }, [map, incidents, selectedId, onSelect]);

  return null;
}
