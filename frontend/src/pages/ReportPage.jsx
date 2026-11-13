import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, CircleCheck, FileText, ImagePlus, LocateFixed, LogIn, MapPin, Send, ShieldAlert, TriangleAlert, X } from "lucide-react";
import { createIncident, findDuplicateIncidents, uploadIncidentAttachment } from "../services/IncidentService.js";
import { CATEGORIES, categoryLabel, shortRef } from "../lib/incidentMeta.js";
import useDocumentTitle from "../lib/useDocumentTitle.js";
import { useAuth } from "../context/AuthContext.jsx";
import PickerMap from "../components/map/PickerMap.jsx";
import StateBox from "../components/ui/StateBox.jsx";
import StatusPill from "../components/ui/StatusPill.jsx";
import { CategoryIcon } from "../components/ui/icons.jsx";
import "./ReportPage.css";

const STEPS = ["Ubicación", "Detalles", "Revisión"];
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_FILES = 4;
const MAX_SIZE = 10 * 1024 * 1024;
const EMPTY = { title: "", description: "", category: "" };

function EvidencePicker({ files, onChange, onError }) {
  const [dragging, setDragging] = useState(false);
  const previews = useMemo(() => files.map((file) => ({ file, url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null })), [files]);
  useEffect(() => () => previews.forEach((preview) => preview.url && URL.revokeObjectURL(preview.url)), [previews]);

  function add(list) {
    const incoming = Array.from(list || []);
    const invalid = incoming.find((file) => !ALLOWED.has(file.type) || file.size > MAX_SIZE);
    if (invalid) { onError(`${invalid.name}: solo se admiten JPG, PNG, WEBP o PDF de hasta 10 MB.`); return; }
    const merged = [...files, ...incoming];
    if (merged.length > MAX_FILES) { onError(`Puedes adjuntar como máximo ${MAX_FILES} archivos.`); return; }
    onError("");
    onChange(merged);
  }

  return (
    <div className="field">
      <span className="field-label">Fotos o documentos <span className="field-optional">(opcional, hasta {MAX_FILES})</span></span>
      <label
        className={`dropzone ${dragging ? "is-dragging" : ""}`}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); add(event.dataTransfer.files); }}
      >
        <ImagePlus size={22} aria-hidden="true" />
        <span><strong>Elige archivos</strong> o arrástralos aquí</span>
        <small>JPG, PNG, WEBP o PDF. Máximo 10 MB cada uno.</small>
        <input type="file" className="sr-only" multiple accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => { add(event.target.files); event.target.value = ""; }} />
      </label>
      {previews.length > 0 && (
        <ul className="evidence-grid">
          {previews.map(({ file, url }) => (
            <li key={`${file.name}-${file.lastModified}`}>
              {url ? <img src={url} alt="" /> : <span className="evidence-doc"><FileText size={22} aria-hidden="true" /></span>}
              <span className="evidence-name">{file.name}</span>
              <button type="button" onClick={() => onChange(files.filter((item) => item !== file))} aria-label={`Quitar ${file.name}`}><X size={14} aria-hidden="true" /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Gate({ icon, title, children, action }) {
  return <div className="page page-narrow"><div className="panel"><StateBox icon={icon} title={title} action={action}>{children}</StateBox></div></div>;
}

export default function ReportPage() {
  useDocumentTitle("Reportar incidencia");
  const { user, loading: authLoading, canReport } = useAuth();
  const routerLocation = useLocation();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [location, setLocation] = useState(null);
  const [files, setFiles] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);
  const [uploadErrors, setUploadErrors] = useState([]);
  const detailsRef = useRef(null);
  const headingRef = useRef(null);

  useEffect(() => {
    if (!location) { setDuplicates([]); return undefined; }
    const timer = window.setTimeout(() => {
      findDuplicateIncidents(location.latitude, location.longitude, form.category || null, 60)
        .then(setDuplicates).catch(() => setDuplicates([]));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [location, form.category]);

  useEffect(() => { headingRef.current?.focus(); }, [step]);

  if (authLoading) return <div className="page page-narrow"><span className="skeleton" style={{ display: "block", height: 280, borderRadius: 16 }} /></div>;
  if (!user) {
    return (
      <Gate icon={LogIn} title="Inicia sesión para reportar"
        action={<Link className="btn btn-primary" to="/login" state={{ from: routerLocation.pathname }}>Iniciar sesión o crear cuenta</Link>}>
        Con tu cuenta podrás comunicar incidencias y seguir cómo avanzan.
      </Gate>
    );
  }
  if (!canReport) {
    return <Gate icon={ShieldAlert} title="Tu perfil no puede crear avisos" action={<Link className="btn btn-outline" to="/">Volver al mapa</Link>}>Los avisos los registran la ciudadanía, los operadores y los administradores.</Gate>;
  }

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  function locateMe() {
    setError("");
    if (!navigator.geolocation) { setError("Tu navegador no permite obtener la ubicación. Márcala en el mapa."); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setLocation({ latitude: coords.latitude, longitude: coords.longitude }),
      () => setError("No se pudo acceder a tu ubicación. Márcala en el mapa."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function next() {
    setError("");
    if (step === 0 && !location) { setError("Marca en el mapa el lugar de la incidencia para continuar."); return; }
    if (step === 1 && !detailsRef.current?.reportValidity()) return;
    setStep((current) => Math.min(current + 1, 2));
  }

  async function submit() {
    setError("");
    setSubmitting(true);
    try {
      const incident = await createIncident({ ...form, title: form.title.trim(), description: form.description.trim(), ...location, category: form.category || null });
      const failed = [];
      for (const file of files) {
        try { await uploadIncidentAttachment(incident.id, file); } catch (uploadError) { failed.push(`${file.name}: ${uploadError.message}`); }
      }
      setUploadErrors(failed);
      setCreated(incident);
    } catch (submitError) {
      setError(submitError.message || "No se pudo enviar el aviso. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setCreated(null); setForm(EMPTY); setLocation(null); setFiles([]); setUploadErrors([]); setStep(0);
  }

  if (created) {
    return (
      <div className="page page-narrow">
        <div className="panel report-done">
          <CircleCheck className="report-done-icon" aria-hidden="true" />
          <h1 tabIndex={-1}>Aviso enviado</h1>
          <p>Gracias. El equipo municipal ya lo tiene y podrás seguir su estado paso a paso.</p>
          <p className="ref-line">Referencia <strong className="tabular">{shortRef(created.id)}</strong></p>
          {uploadErrors.length > 0 && <div className="alert is-warn" role="alert"><TriangleAlert aria-hidden="true" /><div><strong>Algunos archivos no se subieron</strong><p>{uploadErrors.join("; ")}</p></div></div>}
          <div className="row" style={{ justifyContent: "center" }}>
            <Link className="btn btn-primary btn-lg" to={`/incidencias/${created.id}`}>Ver mi incidencia <ArrowRight size={18} aria-hidden="true" /></Link>
            <button type="button" className="btn btn-outline btn-lg" onClick={reset}>Reportar otra</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="report" data-step={step}>
      <section className="report-panel" aria-label="Formulario de reporte">
        <ol className="wizard-steps" aria-label="Pasos">
          {STEPS.map((label, index) => (
            <li key={label} className={index === step ? "is-current" : index < step ? "is-done" : ""} aria-current={index === step ? "step" : undefined}>
              <button type="button" disabled={index > step} onClick={() => setStep(index)}>
                <span className="wizard-num">{index < step ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : index + 1}</span>{label}
              </button>
            </li>
          ))}
        </ol>

        <div className="report-body">
          {step === 0 && (
            <>
              <h1 ref={headingRef} tabIndex={-1}>¿Dónde está el problema?</h1>
              <p className="report-lead">Toca el mapa para colocar el marcador. Después puedes arrastrarlo para afinar.</p>
              <button type="button" className="btn btn-outline" onClick={locateMe}><LocateFixed size={17} aria-hidden="true" /> Usar mi ubicación</button>
              <div className={`location-chip ${location ? "is-set" : ""}`} aria-live="polite">
                <MapPin size={18} aria-hidden="true" />
                {location ? <span>Ubicación marcada <b className="tabular">{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</b></span> : <span>Aún no has marcado ningún punto</span>}
              </div>
            </>
          )}

          {step === 1 && (
            <form ref={detailsRef} className="report-form" onSubmit={(event) => { event.preventDefault(); next(); }}>
              <h1 ref={headingRef} tabIndex={-1}>¿Qué ocurre?</h1>
              <fieldset className="field category-field">
                <legend className="field-label">Categoría <span className="field-optional">(opcional)</span></legend>
                <div className="category-tiles">
                  {CATEGORIES.map(([value, label]) => (
                    <label key={value} className={`category-tile ${form.category === value ? "is-checked" : ""}`}>
                      <input type="radio" className="sr-only" name="category" value={value} checked={form.category === value} onChange={update} onClick={() => { if (form.category === value) setForm((current) => ({ ...current, category: "" })); }} />
                      <CategoryIcon category={value} size={22} /><span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="field">
                <label htmlFor="title">Título</label>
                <input id="title" name="title" className="input" value={form.title} onChange={update} maxLength={120} placeholder="Ej. Farola apagada en calle Larios" required />
              </div>
              <div className="field">
                <label htmlFor="description">Descripción</label>
                <textarea id="description" name="description" className="textarea" rows={5} value={form.description} onChange={update} maxLength={1000} placeholder="Cuenta qué ha pasado y cualquier detalle que ayude a localizarlo." required />
                <span className="field-hint field-count"><span>No incluyas datos personales.</span><span className="tabular">{form.description.length}/1000</span></span>
              </div>
              <EvidencePicker files={files} onChange={setFiles} onError={setError} />
            </form>
          )}

          {step === 2 && (
            <>
              <h1 ref={headingRef} tabIndex={-1}>Revisa y envía</h1>
              <dl className="review">
                <div><dt>Ubicación</dt><dd className="tabular">{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</dd><button type="button" className="link-button" onClick={() => setStep(0)}>Cambiar</button></div>
                <div><dt>Categoría</dt><dd>{form.category ? categoryLabel(form.category) : "Sin categoría"}</dd><button type="button" className="link-button" onClick={() => setStep(1)}>Cambiar</button></div>
                <div><dt>Título</dt><dd>{form.title}</dd><button type="button" className="link-button" onClick={() => setStep(1)}>Cambiar</button></div>
                <div><dt>Descripción</dt><dd className="review-desc">{form.description}</dd></div>
                <div><dt>Archivos</dt><dd>{files.length === 0 ? "Ninguno" : files.map((file) => file.name).join(", ")}</dd></div>
              </dl>
            </>
          )}

          {duplicates.length > 0 && step !== 1 && (
            <div className="alert is-warn" role="status">
              <TriangleAlert aria-hidden="true" />
              <div>
                <strong>{duplicates.length === 1 ? "Ya hay un aviso a menos de 60 m" : `Ya hay ${duplicates.length} avisos a menos de 60 m`}</strong>
                <p>Si es el mismo problema no hace falta repetirlo. Si es otro, continúa.</p>
                <ul className="dup-list">
                  {duplicates.map((item) => (
                    <li key={item.id}><a href={`/incidencias/${item.id}`} target="_blank" rel="noreferrer">{item.title}</a><StatusPill status={item.status} /></li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {error && <div className="alert" role="alert"><TriangleAlert aria-hidden="true" /><span>{error}</span></div>}
        </div>

        <div className="report-actions">
          {step > 0 ? <button type="button" className="btn btn-ghost" onClick={() => { setError(""); setStep(step - 1); }}><ArrowLeft size={17} aria-hidden="true" /> Atrás</button> : <span />}
          {step < 2
            ? <button type="button" className="btn btn-primary btn-lg" onClick={next}>Continuar <ArrowRight size={18} aria-hidden="true" /></button>
            : <button type="button" className="btn btn-accent btn-lg" onClick={submit} disabled={submitting}>{submitting ? <><span className="spinner" /> Enviando…</> : <><Send size={17} aria-hidden="true" /> Enviar aviso</>}</button>}
        </div>
      </section>

      <section className="report-map map-stage" aria-label="Mapa para situar la incidencia">
        <PickerMap location={location} onPick={setLocation} enabled={step === 0} nearby={duplicates} />
        {step === 0 && !location && <div className="map-hint"><MapPin size={17} aria-hidden="true" /> Toca el mapa para marcar el lugar</div>}
      </section>
    </div>
  );
}
