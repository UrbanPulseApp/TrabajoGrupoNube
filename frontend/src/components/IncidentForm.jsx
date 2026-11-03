import { useEffect, useState } from "react";
import IncidentMap from "./IncidentMap.jsx";
import { createIncident, findDuplicateIncidents, uploadIncidentAttachment } from "../services/IncidentService.js";
import "./IncidentForm.css";

const initialForm = { title: "", description: "", category: "" };

const categories = [
  ["STREET", "Vía pública"],
  ["LIGHTING", "Alumbrado"],
  ["CLEANING", "Limpieza"],
  ["GREEN_AREAS", "Zonas verdes"],
  ["TRAFFIC_LIGHT", "Semáforos"],
  ["OTHER", "Otro"],
];

export default function IncidentForm({ onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [location, setLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdIncident, setCreatedIncident] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);

  useEffect(() => {
    if (!location?.latitude || !location?.longitude) {
      setDuplicates([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      setCheckingDuplicates(true);
      try {
        const found = await findDuplicateIncidents(location.latitude, location.longitude, form.category || null, 60.0);
        setDuplicates(found);
      } catch {
        setDuplicates([]);
      } finally {
        setCheckingDuplicates(false);
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [location?.latitude, location?.longitude, form.category]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function locateMe() {
    setError("");
    if (!navigator.geolocation) {
      setError("Tu navegador no permite obtener la ubicación. Puedes elegirla directamente en el mapa.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setLocation({ latitude: coords.latitude, longitude: coords.longitude }),
      () => setError("No se pudo acceder a tu ubicación. Puedes elegirla directamente en el mapa."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function selectEvidence(event) {
    const selected = Array.from(event.target.files || []);
    if (selected.length > 4) {
      setError("Puedes adjuntar como máximo 4 evidencias por incidencia.");
      event.target.value = "";
      return;
    }
    const allowed = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
    const invalid = selected.find((file) => !allowed.has(file.type) || file.size > 10 * 1024 * 1024);
    if (invalid) {
      setError(`${invalid.name}: solo se admiten JPG, PNG, WEBP o PDF de hasta 10 MB.`);
      event.target.value = "";
      return;
    }
    setError("");
    setEvidence(selected);
    event.target.value = "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!location) {
      setError("Indica el lugar de la incidencia en el mapa para continuar.");
      document.getElementById("location-heading")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);
    try {
      const incident = await createIncident({ ...form, ...location, category: form.category || null });
      setCreatedIncident(incident);
      setForm(initialForm);
      setLocation(null);
      setDuplicates([]);
      const uploadErrors = [];
      for (const file of evidence) {
        try { await uploadIncidentAttachment(incident.id, file); }
        catch (uploadError) { uploadErrors.push(`${file.name}: ${uploadError.message}`); }
      }
      setEvidence([]);
      onCreated?.(incident);
      if (uploadErrors.length) {
        setError(`La incidencia se registró, pero no se pudieron subir algunas evidencias. ${uploadErrors.join("; ")}`);
      }
    } catch (submitError) {
      setError(submitError.message || "No se pudo enviar el aviso. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="report-card">
      {createdIncident && (
        <div className="success-message" role="status">
          <span className="success-icon">✓</span>
          <div><strong>Incidencia enviada correctamente</strong><span>Tu aviso ya está enriquecido con contexto urbano y en manos del equipo municipal. Referencia: {createdIncident.id}</span></div>
          <button type="button" className="dismiss-success" onClick={() => setCreatedIncident(null)} aria-label="Cerrar confirmación">×</button>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-layout">
          <div className="form-fields">
            <div className="field-group">
              <label htmlFor="title">Título del aviso <span className="asterisk">*</span></label>
              <input id="title" name="title" value={form.title} onChange={updateField} maxLength={120} placeholder="Ej. Farola apagada en calle Larios" required />
              <span className="field-hint">Resume la incidencia en pocas palabras</span>
            </div>
            <div className="field-group">
              <label htmlFor="category">Categoría <span className="optional">OPCIONAL</span></label>
              <div className="select-wrap">
                <select id="category" name="category" value={form.category} onChange={updateField}>
                  <option value="">Selecciona una categoría</option>
                  {categories.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                </select>
                <span className="select-arrow">⌄</span>
              </div>
              <span className="field-hint">Nos ayuda a dirigir el aviso al equipo adecuado</span>
            </div>
            <div className="field-group description-field">
              <label htmlFor="description">Cuéntanos un poco más <span className="asterisk">*</span></label>
              <textarea id="description" name="description" value={form.description} onChange={updateField} maxLength={1000} placeholder="¿Qué ha ocurrido? Añade cualquier detalle que pueda ser útil…" rows={5} required />
              <div className="textarea-meta"><span>Evita incluir datos personales</span><span>{form.description.length}/1000</span></div>
            </div>
            <div className="field-group evidence-field">
              <label htmlFor="evidence">Añadir evidencias <span className="optional">OPCIONAL · MÁX. 4</span></label>
              <input id="evidence" className="evidence-input" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" multiple onChange={selectEvidence} />
              <span className="field-hint">JPG, PNG, WEBP o PDF · hasta 10 MB por archivo</span>
              {evidence.length > 0 && <ul className="evidence-list">{evidence.map((file) => <li key={`${file.name}-${file.lastModified}`}>{file.name}<button type="button" onClick={() => setEvidence((current) => current.filter((item) => item !== file))} aria-label={`Quitar ${file.name}`}>×</button></li>)}</ul>}
            </div>
          </div>
          <div className="location-field">
            <div className="location-title-row"><label id="location-heading">¿Dónde ocurre? <span className="asterisk">*</span></label><button type="button" className="locate-button" onClick={locateMe}><span aria-hidden="true">⌖</span> Mi ubicación</button></div>
            <p className="location-subtitle">Coloca el marcador sobre el punto exacto</p>
            <IncidentMap latitude={location?.latitude} longitude={location?.longitude} onLocationSelected={setLocation} />
            <div className={`location-status ${location ? "selected" : ""}`} aria-live="polite">
              <span className="status-dot" />
              {location ? `Ubicación seleccionada · ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : "Aún no has indicado una ubicación"}
            </div>

            {/* Aviso inteligente de posibles duplicados */}
            {checkingDuplicates && <div className="duplicate-check-note">Comprobando posibles incidencias registradas en la misma zona…</div>}
            {!checkingDuplicates && duplicates.length > 0 && (
              <div className="duplicate-warning-banner" role="status">
                <span className="duplicate-icon">⚠️</span>
                <div>
                  <strong>Posible incidencia similar cercana</strong>
                  <p>Hemos encontrado {duplicates.length === 1 ? "1 aviso activo" : `${duplicates.length} avisos activos`} a menos de 60 metros:</p>
                  <ul className="duplicate-list">
                    {duplicates.map((dup) => (
                      <li key={dup.id}>
                        <b>{dup.title}</b> ({dup.distanceMeters ? `a aprox. ${dup.distanceMeters} m` : "muy cerca"}) · Estado: {dup.status}
                      </li>
                    ))}
                  </ul>
                  <small>Si tu aviso reporta el mismo desperfecto, puedes omitirlo o continuar si deseas aportar más datos.</small>
                </div>
              </div>
            )}
          </div>
        </div>
        {error && <div className="form-error" role="alert"><span aria-hidden="true">!</span>{error}</div>}
        <div className="form-bottom">
          <span className="form-footnote"><span className="asterisk">*</span> Información necesaria para registrar el aviso</span>
          <button className="submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <><span className="button-spinner" /> Enviando aviso</> : <>Enviar aviso <span aria-hidden="true">↗</span></>}
          </button>
        </div>
      </form>
    </div>
  );
}
