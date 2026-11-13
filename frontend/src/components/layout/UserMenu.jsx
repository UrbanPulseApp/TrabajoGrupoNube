import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, LogOut } from "lucide-react";
import { ROLE_LABEL, useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export default function UserMenu() {
  const { user, loading, logout } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => { if (!ref.current?.contains(event.target)) setOpen(false); };
    const onKey = (event) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (loading) return <span className="skeleton user-skeleton" aria-hidden="true" />;

  if (!user) {
    return (
      <Link className="btn btn-outline btn-sm" to="/login" state={{ from: location.pathname + location.search }}>
        Iniciar sesión
      </Link>
    );
  }

  async function handleLogout() {
    setOpen(false);
    try {
      await logout();
      toast("Has cerrado la sesión.");
    } catch (error) {
      toast(error.message || "No se pudo cerrar la sesión.", "error");
    }
  }

  return (
    <div className="user-menu" ref={ref}>
      <button type="button" className="user-trigger" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((value) => !value)}>
        <span className="avatar" aria-hidden="true">{user.name?.[0]?.toUpperCase() || "U"}</span>
        <span className="user-trigger-name">{user.name}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {open && (
        <div className="user-popover" role="menu">
          <div className="user-popover-head">
            <strong>{user.name}</strong>
            <small>{user.email}</small>
            <span className="role-tag">{ROLE_LABEL[user.role] || user.role}</span>
          </div>
          <button type="button" role="menuitem" className="user-popover-item" onClick={handleLogout}>
            <LogOut size={16} aria-hidden="true" /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
