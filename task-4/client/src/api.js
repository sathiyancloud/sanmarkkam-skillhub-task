import axios from "axios";

export const AUTH_STORAGE_KEY = "eproc_token";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const cfg = err.config;
    const loginAttempt =
      typeof cfg?.url === "string" &&
      cfg.url.includes("/api/auth/login") &&
      String(cfg?.method).toLowerCase() === "post";
    if (err.response?.status === 401 && !loginAttempt && typeof window !== "undefined") {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      delete api.defaults.headers.common.Authorization;
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (body) => api.post("/api/auth/login", body),
  me: () => api.get("/api/auth/me"),
};

export const suppliersApi = {
  list: () => api.get("/api/suppliers"),
  create: (body) => api.post("/api/suppliers", body),
  update: (id, body) => api.put(`/api/suppliers/${id}`, body),
  remove: (id) => api.delete(`/api/suppliers/${id}`),
};

export const requisitionsApi = {
  list: () => api.get("/api/requisitions"),
  create: (body) => api.post("/api/requisitions", body),
  update: (id, body) => api.put(`/api/requisitions/${id}`, body),
  remove: (id) => api.delete(`/api/requisitions/${id}`),
};

export const purchaseOrdersApi = {
  list: () => api.get("/api/purchase-orders"),
  create: (body) => api.post("/api/purchase-orders", body),
  update: (id, body) => api.put(`/api/purchase-orders/${id}`, body),
  remove: (id) => api.delete(`/api/purchase-orders/${id}`),
};

export function formatMoney(n, currency = "USD") {
  const num = Number(n) || 0;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}
