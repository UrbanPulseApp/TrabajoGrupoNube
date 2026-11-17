import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { gecorCategoryGroup } from "../../lib/incidentMeta.js";
import { bucketByGrid, clusterIcon, historicIcon, spreadLeg, zoomToBucket } from "./mapUtils.jsx";

const getLatLng = (incident) => [incident.latitude, incident.longitude];

/**
 * Histórico municipal (miles de puntos): agrupación por cuadrícula según el zoom y, para los
 * puntos sueltos visibles, un disco con el icono del tipo de incidencia.
 */
export default function HistoricLayer({ incidents, selectedId, onSelect }) {
  const map = useMap();

  useEffect(() => {
    const layer = L.layerGroup().addTo(map);
    let frame = null;

    const render = () => {
      frame = null;
      layer.clearLayers();
      const buckets = bucketByGrid(map, incidents, getLatLng, { cellSize: map.getZoom() >= 17 ? 44 : 72, skip: (item) => item.id === selectedId });
      buckets.forEach((bucket) => {
        if (bucket.items.length > 1) {
          L.marker(bucket.center, { icon: clusterIcon(bucket.items.length), keyboard: true, title: `${bucket.items.length} incidencias. Pulsa para acercar.` })
            .on("click", () => zoomToBucket(map, bucket, getLatLng))
            .addTo(layer);
          return;
        }
        const incident = bucket.items[0];
        const selected = incident.id === selectedId;
        const label = incident.category || "Incidencia municipal";
        if (bucket.origin) spreadLeg(bucket).addTo(layer);
        const marker = L.marker(bucket.center, {
          icon: historicIcon(gecorCategoryGroup(incident.category), selected),
          zIndexOffset: selected ? 1000 : 0,
          keyboard: true,
          riseOnHover: true,
        });
        marker.on("add", () => {
          const element = marker.getElement();
          element?.setAttribute("role", "button");
          element?.setAttribute("aria-label", `${label}. Ver expediente`);
        });
        marker.bindTooltip(label, { direction: "top", offset: [0, -14] });
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
