import { apiFetch, responseError } from "./ApiClient.js";

export async function getCurrentUser() {
  const response = await apiFetch("/api/auth/me");
  if (response.status === 401) return null;
  if (!response.ok) throw await responseError(response, "No se pudo comprobar la sesión");
  return response.json();
}

export async function login(credentials) {
  const response = await apiFetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) throw await responseError(response, "No se pudo iniciar sesión");
  return response.json();
}

export async function registerCitizen(account) {
  const response = await apiFetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(account),
  });
  if (!response.ok) throw await responseError(response, "No se pudo crear la cuenta");
  return response.json();
}

export async function logout() {
  const response = await apiFetch("/api/auth/logout", { method: "POST" });
  if (!response.ok && response.status !== 204) throw await responseError(response, "No se pudo cerrar sesión");
}
