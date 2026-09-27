const API_BASE = (import.meta.env.VITE_API_BASE_URL || "https://bhoominetra-backend.onrender.com").replace(/\/$/, "")

export function getToken() {
  return localStorage.getItem("bhoomiAccessToken")
}

export function clearSession() {
  ["bhoomiAccessToken", "bhoomiRefreshToken", "bhoomiRole", "bhoomiBackendRole", "bhoomiEmail", "bhoomiUser"].forEach((key) => localStorage.removeItem(key))
}

async function request(path, options = {}, retry = true) {
  const headers = new Headers(options.headers || {})
  if (options.body && !(options.body instanceof FormData)) headers.set("Content-Type", "application/json")
  const token = getToken()
  if (token) headers.set("Authorization", `Bearer ${token}`)
  headers.set("Accept", "application/json")

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (response.status === 401 && retry) {
    const refresh = localStorage.getItem("bhoomiRefreshToken")
    if (refresh) {
      try {
        const refreshed = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ refresh_token: refresh })
        })
        if (refreshed.ok) {
          const data = await refreshed.json()
          localStorage.setItem("bhoomiAccessToken", data.access_token)
          localStorage.setItem("bhoomiRefreshToken", data.refresh_token)
          return request(path, options, false)
        }
      } catch (_) {}
    }
    clearSession()
    window.location.href = "/login"
    throw new Error("Session expired")
  }

  const raw = await response.text()
  let data = {}
  try { data = raw ? JSON.parse(raw) : {} } catch (_) { data = { message: raw } }
  if (!response.ok) {
    const detail = typeof data.detail === "string" ? data.detail : data.error?.message || data.message || `Request failed (${response.status})`
    throw new Error(detail)
  }
  return data
}

export const api = {
  base: API_BASE,
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
}

export async function loginDemo(role) {
  const data = await api.post("/api/auth/demo-login", { role })
  localStorage.setItem("bhoomiAccessToken", data.access_token)
  localStorage.setItem("bhoomiRefreshToken", data.refresh_token)
  const me = await api.get("/api/auth/me")
  localStorage.setItem("bhoomiBackendRole", me.role)
  localStorage.setItem("bhoomiUser", JSON.stringify(me))
  localStorage.setItem("bhoomiRole", me.role === "NATIONAL_ADMIN" ? "administrative" : "project-manager")
  localStorage.setItem("bhoomiEmail", me.username)
  return me
}

export async function login(username, password) {
  const data = await api.post("/api/auth/login", { username, password })
  localStorage.setItem("bhoomiAccessToken", data.access_token)
  localStorage.setItem("bhoomiRefreshToken", data.refresh_token)
  const me = await api.get("/api/auth/me")
  localStorage.setItem("bhoomiBackendRole", me.role)
  localStorage.setItem("bhoomiUser", JSON.stringify(me))
  localStorage.setItem("bhoomiRole", me.role === "NATIONAL_ADMIN" ? "administrative" : "project-manager")
  localStorage.setItem("bhoomiEmail", me.username)
  return me
}
