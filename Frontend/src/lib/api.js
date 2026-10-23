const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://bhoominetra-production-dc06.up.railway.app"
).replace(/\/$/, "")

let refreshPromise = null

export function getToken() {
  return localStorage.getItem("bhoomiAccessToken")
}

export function clearSession() {
  [
    "bhoomiAccessToken",
    "bhoomiRefreshToken",
    "bhoomiRole",
    "bhoomiBackendRole",
    "bhoomiEmail",
    "bhoomiUser",
  ].forEach((key) => {
    localStorage.removeItem(key)
  })
}

async function parseResponse(response) {
  const raw = await response.text()

  if (!raw) {
    return {}
  }

  try {
    return JSON.parse(raw)
  } catch {
    return {
      message: raw,
    }
  }
}

async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise
  }

  const refreshToken = localStorage.getItem(
    "bhoomiRefreshToken"
  )

  if (!refreshToken) {
    return false
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/auth/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            refresh_token: refreshToken,
          }),
        }
      )

      if (!response.ok) {
        return false
      }

      const data = await parseResponse(response)

      if (!data.access_token) {
        return false
      }

      localStorage.setItem(
        "bhoomiAccessToken",
        data.access_token
      )

      if (data.refresh_token) {
        localStorage.setItem(
          "bhoomiRefreshToken",
          data.refresh_token
        )
      }

      return true
    } catch (error) {
      console.error(
        "Token refresh failed:",
        error
      )

      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

async function request(
  path,
  options = {},
  retry = true
) {
  const headers = new Headers(
    options.headers || {}
  )

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    )
  }

  headers.set(
    "Accept",
    "application/json"
  )

  const token = getToken()

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    )
  }

  const response = await fetch(
    `${API_BASE}${path}`,
    {
      ...options,
      headers,
    }
  )

  /*
   * Access token expired.
   *
   * Only one refresh request is allowed.
   * Other failed requests wait for the same promise.
   */
  if (
    response.status === 401 &&
    retry
  ) {
    const refreshed =
      await refreshAccessToken()

    if (refreshed) {
      return request(
        path,
        options,
        false
      )
    }

    clearSession()

    if (
      window.location.pathname !==
      "/login"
    ) {
      window.location.replace(
        "/login"
      )
    }

    throw new Error(
      "Session expired"
    )
  }

  const data =
    await parseResponse(response)

  if (!response.ok) {
    const detail =
      typeof data?.detail === "string"
        ? data.detail
        : data?.error?.message ||
          data?.message ||
          `Request failed (${response.status})`

    const error =
      new Error(detail)

    error.status =
      response.status

    error.data = data

    throw error
  }

  return data
}

export const api = {
  base: API_BASE,

  get(path, options = {}) {
    return request(path, {
      ...options,
      method: "GET",
    })
  },

  post(
    path,
    body = {},
    options = {}
  ) {
    return request(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    })
  },

  put(
    path,
    body = {},
    options = {}
  ) {
    return request(path, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    })
  },

  patch(
    path,
    body = {},
    options = {}
  ) {
    return request(path, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    })
  },

  delete(path, options = {}) {
    return request(path, {
      ...options,
      method: "DELETE",
    })
  },
}

/*
 * IMPORTANT:
 * Demo login uses the backend's existing
 * /api/auth/demo-login endpoint.
 */
export async function loginDemo(role) {
  // A failed /me request must not leave a half-authenticated session behind.
  clearSession()

  try {
    const data = await api.post(
      "/api/auth/demo-login",
      { role }
    )

    if (!data?.access_token || !data?.refresh_token) {
      throw new Error("The demo-login endpoint returned an incomplete token response.")
    }

    localStorage.setItem("bhoomiAccessToken", data.access_token)
    localStorage.setItem("bhoomiRefreshToken", data.refresh_token)

    const me = await api.get("/api/auth/me")

    if (!me?.role || !me?.username) {
      throw new Error("The backend did not return a valid demo-user profile.")
    }

    localStorage.setItem("bhoomiBackendRole", me.role)
    localStorage.setItem("bhoomiUser", JSON.stringify(me))
    localStorage.setItem(
      "bhoomiRole",
      me.role === "NATIONAL_ADMIN"
        ? "administrative"
        : me.role === "LOCAL_CITIZEN"
          ? "local-citizen"
          : "project-manager"
    )
    localStorage.setItem("bhoomiEmail", me.username)

    return me
  } catch (error) {
    clearSession()
    throw error
  }
}

export async function login(
  usernameOrCredentials,
  password
) {
  // Backward-compatible with the original login page, which calls
  // login({ email, password }), while also supporting login(username, password).
  const username =
    typeof usernameOrCredentials === "object" && usernameOrCredentials !== null
      ? (usernameOrCredentials.username || usernameOrCredentials.email || "")
      : (usernameOrCredentials || "")
  const actualPassword =
    typeof usernameOrCredentials === "object" && usernameOrCredentials !== null
      ? usernameOrCredentials.password
      : password

  if (!String(username).trim() || !actualPassword) {
    throw new Error("Please enter your email/username and password.")
  }

  const data = await api.post(
    "/api/auth/login",
    {
      username: String(username).trim(),
      password: actualPassword,
    }
  )

  localStorage.setItem(
    "bhoomiAccessToken",
    data.access_token
  )

  localStorage.setItem(
    "bhoomiRefreshToken",
    data.refresh_token
  )

  const me = await api.get(
    "/api/auth/me"
  )

  localStorage.setItem(
    "bhoomiBackendRole",
    me.role
  )

  localStorage.setItem(
    "bhoomiUser",
    JSON.stringify(me)
  )

  localStorage.setItem(
    "bhoomiRole",
    me.role === "NATIONAL_ADMIN"
      ? "administrative"
      : me.role === "LOCAL_CITIZEN"
        ? "local-citizen"
        : "project-manager"
  )

  localStorage.setItem(
    "bhoomiEmail",
    me.username
  )

  return me
}

export { API_BASE }
