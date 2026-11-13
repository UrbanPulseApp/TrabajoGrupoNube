import { useEffect } from "react";

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · UrbanPulse` : "UrbanPulse · Incidencias urbanas en Málaga";
  }, [title]);
}
