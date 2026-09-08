import { apiFetch } from "./apiClient";

import type {
  DashboardSummary,
} from "../types/dashboard";

export async function getDashboardSummary():
  Promise<DashboardSummary> {

  const response = await apiFetch(
    "/api/Dashboard/summary",
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error(
      "No se pudo cargar el resumen del dashboard."
    );
  }

  return response.json();
}