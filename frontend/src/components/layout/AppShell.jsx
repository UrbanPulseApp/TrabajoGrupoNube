import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import { ChartColumn, History, Map, Plus, UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import BrandMark from "../ui/BrandMark.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import UserMenu from "./UserMenu.jsx";
import "./AppShell.css";

function Topbar() {
  const { canAnalytics } = useAuth();
  const linkClass = ({ isActive }) => `nav-link ${isActive ? "is-active" : ""}`;
  return (
    <header className="topbar">
      <Link className="brand" to="/" aria-label="UrbanPulse, ir al mapa">
        <BrandMark />
        <span>urban<b>pulse</b></span>
      </Link>
      <nav className="topbar-nav" aria-label="Principal">
        <NavLink to="/" end className={linkClass}>Explorar</NavLink>
        <NavLink to="/historico" className={linkClass}>Histórico municipal</NavLink>
        {canAnalytics && <NavLink to="/analitica" className={linkClass}>Analítica</NavLink>}
      </nav>
      <div className="topbar-actions">
        <Link className="btn btn-accent btn-sm topbar-report" to="/reportar"><Plus size={17} aria-hidden="true" /> Reportar incidencia</Link>
        <ThemeToggle />
        <span className="topbar-user"><UserMenu /></span>
      </div>
    </header>
  );
}

function BottomNav() {
  const { user, canAnalytics } = useAuth();
  const location = useLocation();
  const linkClass = ({ isActive }) => `bottom-link ${isActive ? "is-active" : ""}`;
  return (
    <nav className="bottom-nav" aria-label="Navegación móvil">
      <NavLink to="/" end className={linkClass}><Map size={21} aria-hidden="true" /><span>Mapa</span></NavLink>
      <NavLink to="/historico" className={linkClass}><History size={21} aria-hidden="true" /><span>Histórico</span></NavLink>
      <NavLink to="/reportar" className="bottom-report" aria-label="Reportar incidencia"><Plus size={24} aria-hidden="true" /></NavLink>
      {canAnalytics
        ? <NavLink to="/analitica" className={linkClass}><ChartColumn size={21} aria-hidden="true" /><span>Analítica</span></NavLink>
        : <span className="bottom-spacer" aria-hidden="true" />}
      <NavLink to="/login" state={{ from: location.pathname }} className={linkClass}>
        <UserRound size={21} aria-hidden="true" /><span>{user ? "Cuenta" : "Entrar"}</span>
      </NavLink>
    </nav>
  );
}

export default function AppShell() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">Saltar al contenido</a>
      <Topbar />
      <main id="main" className="app-main"><Outlet /></main>
      <BottomNav />
    </div>
  );
}
