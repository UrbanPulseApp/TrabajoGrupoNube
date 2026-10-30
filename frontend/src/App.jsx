import { useEffect, useState } from "react";
import IncidentForm from "./components/IncidentForm.jsx";
import IncidentBoard from "./components/IncidentBoard.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import { getCurrentUser, logout } from "./services/AuthService.js";
import "./app-auth.css";

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </span>
  );
}

function Header({ currentUser, onNavigate, onLogout }) {
  return (
    <header className="site-header">
      <a className="brand" href="#inicio" aria-label="UrbanPulse, inicio">
        <BrandMark />
        <span>urban<span className="brand-light">pulse</span></span>
      </a>
      <nav className="header-nav" aria-label="Navegación principal">
        <a className="nav-link active" href="#reportar">Reportar incidencia</a>
        <a className="nav-link" href="#incidencias">Seguimiento</a>
        <a className="nav-link" href="#como-funciona">Cómo funciona</a>
      </nav>
      {currentUser
        ? <button className="header-action" type="button" onClick={onLogout} title={`Sesión de ${currentUser.name}`}><span className="online-dot" /><span>Cerrar sesión · {currentUser.name}</span></button>
        : <a className="header-action" href="/login" onClick={(event) => { event.preventDefault(); onNavigate("/login"); }}><span className="online-dot" /><span>Iniciar sesión</span></a>}
    </header>
  );
}

function Intro() {
  return (
    <section className="intro" id="inicio">
      <div className="intro-copy">
        <div className="eyebrow"><span className="eyebrow-line" /> MÁLAGA · CIUDADANÍA</div>
        <h1>Tu ciudad, <span>en movimiento.</span></h1>
        <p>Una farola apagada, un bache, una papelera llena. Cuéntanos qué ocurre y ayudemos a que las cosas mejoren.</p>
        <div className="intro-note">
          <span className="note-icon" aria-hidden="true">↗</span>
          <span>Un pequeño aviso puede cambiar toda una calle.</span>
        </div>
      </div>
      <div className="city-art" aria-hidden="true">
        <div className="sun" />
        <div className="cloud cloud-one" /><div className="cloud cloud-two" />
        <div className="skyline skyline-back"><i /><i /><i /><i /><i /></div>
        <div className="skyline skyline-front"><i /><i /><i /><i /></div>
        <div className="art-street"><span /><span /><span /></div>
        <div className="map-pin"><span>UP</span></div>
      </div>
      <div className="intro-index"><span>01</span><i /> UNA CIUDAD MEJOR, ENTRE TODOS</div>
    </section>
  );
}

function Steps() {
  return (
    <section className="steps" id="como-funciona" aria-label="Cómo funciona">
      <div className="steps-heading"><span className="section-kicker">ASÍ DE SENCILLO</span><span className="steps-caption">Solo te llevará un minuto</span></div>
      <div className="step"><span className="step-number">01</span><span className="step-icon">⌖</span><div><strong>Ubica</strong><small>Señala el lugar exacto</small></div></div>
      <span className="step-connector" />
      <div className="step"><span className="step-number">02</span><span className="step-icon">✎</span><div><strong>Describe</strong><small>Cuéntanos qué sucede</small></div></div>
      <span className="step-connector" />
      <div className="step"><span className="step-number">03</span><span className="step-icon">↗</span><div><strong>Enviado</strong><small>El equipo municipal lo recibe</small></div></div>
    </section>
  );
}

function App() {
  const [route, setRoute] = useState(window.location.pathname);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [boardRefresh, setBoardRefresh] = useState(0);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    getCurrentUser().then(setCurrentUser).catch(() => setCurrentUser(null)).finally(() => setAuthLoading(false));
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function navigate(path) {
    window.history.pushState({}, "", path);
    setRoute(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleLogout() {
    setAuthError("");
    try {
      await logout();
      setCurrentUser(null);
    } catch (error) {
      setAuthError(error.message || "No se pudo cerrar la sesión.");
    }
  }

  if (route === "/login") {
    return <LoginPage onAuthenticated={(user) => { setCurrentUser(user); navigate("/"); }} onNavigateHome={() => navigate("/")} />;
  }

  return (
    <div className="app-shell">
      <Header currentUser={currentUser} onNavigate={navigate} onLogout={handleLogout} />
      <main>
        <Intro />
        <Steps />
        <IncidentBoard refreshKey={boardRefresh} currentUser={currentUser} onChanged={() => setBoardRefresh((value) => value + 1)} />
        <section className="report-section" id="reportar">
          {authError && <div className="auth-session-error" role="alert">{authError}</div>}
          <div className="report-heading">
            <div><span className="section-kicker">TU VOZ CUENTA</span><h2>¿Qué está pasando?</h2></div>
            <span className="required-note"><i /> Campos obligatorios</span>
          </div>
          {authLoading
            ? <div className="login-gate">Comprobando la sesión…</div>
            : currentUser
              ? <IncidentForm onCreated={() => setBoardRefresh((value) => value + 1)} />
              : <div className="login-gate"><strong>Inicia sesión para comunicar una incidencia.</strong><span>Tu cuenta permite consultar y gestionar tus avisos.</span><a href="/login" onClick={(event) => { event.preventDefault(); navigate("/login"); }}>Iniciar sesión o crear cuenta <span aria-hidden="true">↗</span></a></div>}
          <div className="privacy-note"><span aria-hidden="true">◈</span> Tus datos se utilizan únicamente para gestionar esta incidencia.</div>
        </section>
        <footer className="site-footer"><a className="brand footer-brand" href="#inicio"><BrandMark /><span>urban<span className="brand-light">pulse</span></span></a><span>Una ciudad más cuidada empieza contigo.</span><span className="footer-city">MÁLAGA <i>·</i> 2026</span></footer>
      </main>
    </div>
  );
}

export default App;
