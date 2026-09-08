import type {
  Category,
} from "../types/category";

import {
  apiFetch,
} from "./apiClient";

import {
  throwApiError,
} from "./apiError";

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

export interface UpdateCategoryRequest {
  name: string;
  description: string;
}

export async function getCategories():
  Promise<Category[]> {

  const response = await apiFetch(
    "/api/Categories",
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    await throwApiError(
      response,
      "No se pudieron cargar las categorías."
    );
  }

  return response.json();
}

export async function createCategory(
  data: CreateCategoryRequest
): Promise<Category> {

  const response = await apiFetch(
    "/api/Categories",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    await throwApiError(
      response,
      "No se pudo crear la categoría."
    );
  }

  return response.json();
}

export async function updateCategory(
  id: number,
  data: UpdateCategoryRequest
): Promise<Category> {

  const response = await apiFetch(
    `/api/Categories/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    await throwApiError(
      response,
      "No se pudo actualizar la categoría."
    );
  }

  return response.json();
}

export async function deleteCategory(
  id: number
): Promise<void> {

  const response = await apiFetch(
    `/api/Categories/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    await throwApiError(
      response,
      "No se pudo eliminar la categoría."
    );
  }
}