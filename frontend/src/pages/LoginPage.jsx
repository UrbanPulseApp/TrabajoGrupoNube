import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Eye, EyeOff, LogOut, MapPin, Route, TriangleAlert } from "lucide-react";
import { login, registerCitizen } from "../services/AuthService.js";
import { ROLE_LABEL, useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import useDocumentTitle from "../lib/useDocumentTitle.js";
import BrandMark from "../components/ui/BrandMark.jsx";
import ThemeToggle from "../components/layout/ThemeToggle.jsx";
import "./LoginPage.css";

export default function LoginPage() {
  const { user, setUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // Solo se vuelve a rutas internas: una barra inicial que no vaya seguida de otra barra ni de "\\"
  const requested = location.state?.from;
  const from = typeof requested === "string" && /^\/(?![/\\])/.test(requested) && !requested.startsWith("/login") ? requested : "/";
  const register = mode === "register";

  useDocumentTitle(user ? "Tu cuenta" : register ? "Crear cuenta" : "Iniciar sesión");

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (register) await registerCitizen(form);
      const account = await login({ email: form.email, password: form.password });
      setUser(account);
      toast(`Hola, ${account.name}.`);
      navigate(from, { replace: true });
    } catch (submitError) {
      setError(submitError.message || "No se pudo completar la operación.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    try { await logout(); toast("Has cerrado la sesión."); } catch (logoutError) { toast(logoutError.message || "No se pudo cerrar la sesión.", "error"); }
  }

  return (
    <div className="auth">
      <aside className="auth-aside">
        <Link className="brand auth-brand" to="/"><BrandMark size={30} /><span>urban<b>pulse</b></span></Link>
        <div className="auth-pitch">
          <h1>La ciudad se arregla antes cuando alguien avisa.</h1>
          <ul>
            <li><MapPin aria-hidden="true" /><span>Marca el problema en el mapa en segundos.</span></li>
            <li><Camera aria-hidden="true" /><span>Añade fotos para que el equipo lo encuentre.</span></li>
            <li><Route aria-hidden="true" /><span>Sigue cada aviso desde que se recibe hasta que se cierra.</span></li>
          </ul>
        </div>
        <p className="auth-foot">Málaga, 2026</p>
      </aside>

      <main className="auth-main" id="main">
        <div className="auth-top">
          <Link className="back-link" to="/" style={{ margin: 0 }}><ArrowLeft size={17} aria-hidden="true" /> Volver al mapa</Link>
          <ThemeToggle />
        </div>

        {user ? (
          <div className="auth-card">
            <span className="avatar avatar-lg" aria-hidden="true">{user.name?.[0]?.toUpperCase() || "U"}</span>
            <h2>{user.name}</h2>
            <p className="auth-sub">{user.email}</p>
            <span className="role-tag" style={{ justifySelf: "center" }}>{ROLE_LABEL[user.role] || user.role}</span>
            <div className="auth-account-actions">
              <Link className="btn btn-primary" to="/">Ir al mapa</Link>
              <button type="button" className="btn btn-outline" onClick={handleLogout}><LogOut size={16} aria-hidden="true" /> Cerrar sesión</button>
            </div>
          </div>
        ) : (
          <div className="auth-card">
            <h2>{register ? "Crea tu cuenta" : "Inicia sesión"}</h2>
            <p className="auth-sub">{register ? "El registro crea una cuenta ciudadana." : "Accede para reportar y seguir tus avisos."}</p>
            {error && <div className="alert" role="alert"><TriangleAlert aria-hidden="true" /><span>{error}</span></div>}
            <form className="auth-form" onSubmit={handleSubmit}>
              {register && (
                <div className="field"><label htmlFor="name">Nombre</label><input id="name" name="name" className="input" autoComplete="name" value={form.name} onChange={update} maxLength={100} required /></div>
              )}
              <div className="field"><label htmlFor="email">Correo electrónico</label><input id="email" name="email" type="email" className="input" autoComplete="email" value={form.email} onChange={update} maxLength={150} required /></div>
              <div className="field">
                <label htmlFor="password">Contraseña</label>
                <div className="password-wrap">
                  <input id="password" name="password" className="input" type={showPassword ? "text" : "password"} autoComplete={register ? "new-password" : "current-password"} value={form.password} onChange={update} minLength={register ? 12 : undefined} maxLength={72} required />
                  <button type="button" className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>{showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}</button>
                </div>
                {register && <span className="field-hint">Mínimo 12 caracteres.</span>}
              </div>
              <button className="btn btn-primary btn-lg" type="submit" disabled={submitting}>{submitting ? <><span className="spinner" /> Un momento…</> : register ? "Crear cuenta y entrar" : "Entrar"}</button>
            </form>
            <p className="auth-switch">
              {register ? "¿Ya tienes cuenta?" : "¿Aún no tienes cuenta?"}{" "}
              <button type="button" className="link-button" onClick={() => { setError(""); setMode(register ? "login" : "register"); }}>{register ? "Inicia sesión" : "Regístrate"}</button>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
