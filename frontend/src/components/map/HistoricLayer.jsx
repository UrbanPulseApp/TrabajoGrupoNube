import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { bucketByGrid, clusterIcon, zoomToBucket } from "./mapUtils.jsx";

const getLatLng = (incident) => [incident.latitude, incident.longitude];

/** Histórico municipal (miles de puntos): círculos en canvas + agrupación por zoom. */
export default function HistoricLayer({ incidents, selectedId, onSelect, color, selectedColor }) {
  const map = useMap();

  useEffect(() => {
    const layer = L.layerGroup().addTo(map);
    let frame = null;

    const render = () => {
      frame = null;
      layer.clearLayers();
      const buckets = bucketByGrid(map, incidents, getLatLng, { cellSize: map.getZoom() >= 17 ? 40 : 76, skip: (item) => item.id === selectedId });
      buckets.forEach((bucket) => {
        if (bucket.items.length > 1) {
          L.marker(bucket.center, { icon: clusterIcon(bucket.items.length), keyboard: true, title: `${bucket.items.length} incidencias` })
            .on("click", () => zoomToBucket(map, bucket, getLatLng))
            .addTo(layer);
          return;
        }
        const incident = bucket.items[0];
        const selected = incident.id === selectedId;
        const dot = L.circleMarker(bucket.center, {
          radius: selected ? 10 : 6,
          color: selected ? selectedColor : "#ffffff",
          weight: selected ? 3 : 1.5,
          fillColor: selected ? selectedColor : color,
          fillOpacity: selected ? 0.9 : 0.8,
        });
        dot.on("click", (event) => { L.DomEvent.stopPropagation(event); onSelect(incident.id); });
        dot.bindTooltip(incident.category || "Incidencia", { direction: "top", offset: [0, -6] });
        dot.addTo(layer);
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
  }, [map, incidents, selectedId, onSelect, color, selectedColor]);

  return null;
}
