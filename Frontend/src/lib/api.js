const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://bhoominetra-backend.onrender.com"
).replace(/\/$/, "");

let refreshPromise = null;

/* =========================
   TOKEN HELPERS
========================= */

export function getToken() {
  return localStorage.getItem("bhoomiAccessToken");
}

export function getRefreshToken() {
  return localStorage.getItem("bhoomiRefreshToken");
}

/* =========================
   SESSION
========================= */

export function clearSession() {
  const keys = [
    "bhoomiAccessToken",
    "bhoomiRefreshToken",
    "bhoomiRole",
    "bhoomiBackendRole",
    "bhoomiEmail",
    "bhoomiUser",
  ];

  keys.forEach((key) => {
    localStorage.removeItem(key);
  });
}

/* =========================
   LOGIN
========================= */

export async function login(email, password) {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        data?.error ||
        "Login failed"
    );
  }

  if (data.access_token) {
    localStorage.setItem(
      "bhoomiAccessToken",
      data.access_token
    );
  }

  if (data.refresh_token) {
    localStorage.setItem(
      "bhoomiRefreshToken",
      data.refresh_token
    );
  }

  return data;
}

/* =========================
   REFRESH TOKEN
========================= */

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  // If another request is already refreshing,
  // wait for that same request instead of creating
  // multiple refresh requests.
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(
        `${API_BASE}/api/auth/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh_token: refreshToken,
          }),
        }
      );

      const data = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            data?.error ||
            "Token refresh failed"
        );
      }

      if (!data.access_token) {
        throw new Error(
          "Refresh response did not contain access_token"
        );
      }

      localStorage.setItem(
        "bhoomiAccessToken",
        data.access_token
      );

      if (data.refresh_token) {
        localStorage.setItem(
          "bhoomiRefreshToken",
          data.refresh_token
        );
      }

      return data.access_token;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/* =========================
   REDIRECT
========================= */

function redirectToLogin() {
  clearSession();

  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

/* =========================
   RESPONSE PARSER
========================= */

async function parseResponse(response) {
  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  const text = await response.text();

  if (!text) {
    return {};
  }

  return {
    message: text,
  };
}

/* =========================
   MAIN REQUEST
========================= */

async function request(
  path,
  options = {},
  retry = true
) {
  const token = getToken();

  const headers = new Headers(
    options.headers || {}
  );

  if (!headers.has("Content-Type") && options.body) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  let response;

  try {
    response = await fetch(
      `${API_BASE}${path}`,
      {
        ...options,
        headers,
      }
    );
  } catch (error) {
    throw new Error(
      error?.message ||
        "Unable to connect to backend"
    );
  }

  /* =========================
     HANDLE 401
  ========================= */

  if (response.status === 401 && retry) {
    try {
      await refreshAccessToken();

      // Retry original request once with new token.
      return request(path, options, false);
    } catch {
      redirectToLogin();

      throw new Error(
        "Session expired. Please login again."
      );
    }
  }

  /* =========================
     HANDLE OTHER ERRORS
  ========================= */

  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    const error = new Error(message);

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

/* =========================
   API OBJECT
========================= */

export const api = {
  get(path, options = {}) {
    return request(path, {
      ...options,
      method: "GET",
    });
  },

  post(path, body = {}, options = {}) {
    return request(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  put(path, body = {}, options = {}) {
    return request(path, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  patch(path, body = {}, options = {}) {
    return request(path, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  delete(path, options = {}) {
    return request(path, {
      ...options,
      method: "DELETE",
    });
  },
};

/* =========================
   LOGOUT
========================= */

export async function logout() {
  try {
    await api.post("/api/auth/logout", {});
  } catch {
    // Even if backend logout fails,
    // clear the local session.
  }

  clearSession();
}

/* =========================
   API BASE URL
========================= */

export { API_BASE };