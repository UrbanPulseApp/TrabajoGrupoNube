import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser, logout as apiLogout } from "../services/AuthService.js";

const AuthContext = createContext(null);

const CAN_REPORT = ["CITIZEN", "OPERATOR", "ADMIN"];
const CAN_MANAGE = ["OPERATOR", "ADMIN"];
const IS_STAFF = ["OPERATOR", "TECHNICIAN", "ADMIN"];
const CAN_ANALYTICS = ["OPERATOR", "ADMIN", "ANALYST"];

export const ROLE_LABEL = {
  CITIZEN: "Ciudadanía", OPERATOR: "Operador", TECHNICIAN: "Técnico", ADMIN: "Administrador", ANALYST: "Analista",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    setUser,
    logout,
    canReport: !!user && CAN_REPORT.includes(user.role),
    canManage: !!user && CAN_MANAGE.includes(user.role),
    isStaff: !!user && IS_STAFF.includes(user.role),
    canAnalytics: !!user && CAN_ANALYTICS.includes(user.role),
  }), [user, loading, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
