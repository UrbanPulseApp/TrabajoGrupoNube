let csrfToken = null;

export async function getCsrfToken() {
  if (csrfToken) return csrfToken;
  const response = await fetch("/api/auth/csrf", { credentials: "include" });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.token) {
    throw new Error("No se pudo preparar una solicitud segura. Recarga la página e inténtalo de nuevo.");
  }
  csrfToken = data.token;
  return csrfToken;
}

export async function apiFetch(url, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    headers.set("X-XSRF-TOKEN", await getCsrfToken());
  }
  return fetch(url, { ...options, method, headers, credentials: "include" });
}

export async function responseError(response, fallback) {
  const data = await response.json().catch(() => null);
  return new Error(data?.detail || data?.message || fallback);
}
