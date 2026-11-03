import { useState } from "react";
import { login, registerCitizen } from "../services/AuthService.js";
import "./LoginPage.css";

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true"><span /><span /><span /><span /></span>;
}

export default function LoginPage({ onAuthenticated, onNavigateHome }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (mode === "register") await registerCitizen(form);
      const user = await login({ email: form.email, password: form.password });
      onAuthenticated(user);
    } catch (submitError) {
      setError(submitError.message || "No se pudo completar la operación.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-topbar">
        <a className="auth-brand" href="/" onClick={(event) => { event.preventDefault(); onNavigateHome(); }}>
          <BrandMark /><span>urban<span>pulse</span></span>
        </a>
        <a className="auth-back" href="/" onClick={(event) => { event.preventDefault(); onNavigateHome(); }}>← Volver a la página principal</a>
      </div>
      <section className="auth-layout">
        <aside className="auth-aside">
          <span className="auth-eyebrow"><i /> MÁLAGA · CIUDADANÍA</span>
          <h1>Una ciudad mejor empieza <em>contigo.</em></h1>
          <p>Accede a UrbanPulse para comunicar incidencias y seguir cómo evoluciona cada aviso.</p>
          <div className="auth-aside-note"><span>↗</span><div><strong>Tu cuenta, tu ciudad</strong><small>Un espacio sencillo para participar y estar al día.</small></div></div>
          <div className="auth-city-art" aria-hidden="true"><div className="auth-sun"/><div className="auth-building building-a"/><div className="auth-building building-b"/><div className="auth-building building-c"/><div className="auth-road"/><span className="auth-pin">UP</span></div>
        </aside>

        <div className="auth-panel">
          {error && <div className="auth-error" role="alert">{error}</div>}
          <div className="auth-panel-heading">
            <span className="section-kicker">{mode === "login" ? "QUÉ BUENO VERTE" : "PARTICIPA EN TU CIUDAD"}</span>
            <h2>{mode === "login" ? "Inicia sesión" : "Crea tu cuenta"}</h2>
            <p>{mode === "login" ? "Introduce tus datos para continuar." : "El registro crea una cuenta ciudadana."}</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "register" && <div className="auth-field"><label htmlFor="name">Nombre</label><input id="name" name="name" autoComplete="name" value={form.name} onChange={updateField} maxLength={100} required /></div>}
            <div className="auth-field"><label htmlFor="email">Correo electrónico</label><input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={updateField} maxLength={150} required /></div>
            <div className="auth-field"><label htmlFor="password">Contraseña</label><input id="password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={form.password} onChange={updateField} minLength={mode === "register" ? 12 : undefined} maxLength={72} required /><small>{mode === "register" ? "Mínimo 12 caracteres." : ""}</small></div>
            <button className="auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Un momento…" : mode === "login" ? "Entrar" : "Crear cuenta y entrar"}<span aria-hidden="true">↗</span></button>
          </form>
          <div className="auth-switch">
            {mode === "login" ? <>¿Aún no tienes cuenta? <button type="button" onClick={() => { setError(""); setMode("register"); }}>Regístrate como ciudadano</button></> : <>¿Ya tienes cuenta? <button type="button" onClick={() => { setError(""); setMode("login"); }}>Inicia sesión</button></>}
          </div>
          <div className="auth-security"><span>◈</span> La contraseña se transmite por sesión segura y no se guarda en el navegador.</div>
        </div>
      </section>
      <footer className="auth-footer"><span>URBANPULSE</span><span>MÁLAGA · CIUDADANÍA</span></footer>
    </main>
  );
}
