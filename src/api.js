import axios from "axios";

import { supabase } from "./supabaseClient.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
});

// Attach the current Supabase access token to every backend request.
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

function mapUser(supabaseUser) {
  if (!supabaseUser) {
    return null;
  }

  const metadata = supabaseUser.user_metadata || {};
  return {
    email: supabaseUser.email || "",
    name: metadata.name || metadata.full_name || supabaseUser.email || "User",
    role: metadata.role || "Merchandiser",
  };
}

export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(error.message || "Unable to sign in.");
  }
  return mapUser(data.user);
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getSession();
  return mapUser(data.session?.user || null);
}

export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(mapUser(session?.user || null));
  });
  return () => data.subscription.unsubscribe();
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
