import axios from "axios";

const TOKEN_KEY = "wfx-access-token";
const USER_KEY = "wfx-user";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function persistSession(accessToken, user) {
  sessionStorage.setItem(TOKEN_KEY, accessToken);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  const raw = sessionStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function getStoredToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export async function login(payload) {
  const response = await api.post("/api/auth/login", payload);
  return response.data;
}

export async function getMe() {
  const response = await api.get("/api/auth/me");
  return response.data;
}

export async function getDashboardSummary() {
  const response = await api.get("/api/dashboard/summary");
  return response.data;
}

export async function getProducts(params) {
  const response = await api.get("/api/products", { params });
  return response.data;
}

export async function getProductDetail(styleNumber) {
  const response = await api.get(`/api/products/${styleNumber}`);
  return response.data;
}

export async function askAssistant(question) {
  const response = await api.post("/api/ai/chat", { question });
  return response.data;
}

export async function searchProducts(params) {
  const response = await api.post("/api/search/products", params);
  return response.data;
}

export async function searchByImage({ file, imageUrl, limit = 12 }) {
  if (file) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("limit", String(limit));
    const response = await api.post("/api/search/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  const response = await api.post("/api/search/image-url", {
    image_url: imageUrl,
    limit,
  });
  return response.data;
}

export async function reindexProducts(limit = 1500) {
  const response = await api.post("/api/search/reindex", { limit, include_embeddings: true });
  return response.data;
}
