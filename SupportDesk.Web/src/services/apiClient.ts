import { API_URL } from "../config/api";
import { getAuth } from "./authStorage";
import { notifyUnauthorized } from "./authEvents";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const auth = getAuth();

  const headers = new Headers(
    options.headers
  );

  if (auth?.token) {
    headers.set(
      "Authorization",
      `Bearer ${auth.token}`
    );
  }

  const isFormData =
    options.body instanceof FormData;

  if (
    options.body &&
    !isFormData &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  if (response.status === 401) {
    notifyUnauthorized();
  }

  return response;
}