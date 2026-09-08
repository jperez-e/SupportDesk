import type {
  UserResponse,
} from "../types/user";

import type {
  UserRole,
} from "../types/auth";

import { apiFetch } from "./apiClient";
import { throwApiError } from "./apiError";

export async function getUsers():
  Promise<UserResponse[]> {

  const response = await apiFetch(
    "/api/Users",
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    await throwApiError(
      response,
      "No se pudieron cargar los usuarios."
    );
  }

  return response.json();
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
}

export async function updateUserRole(
  userId: number,
  data: UpdateUserRoleRequest
): Promise<UserResponse> {

  const response = await apiFetch(
    `/api/Users/${userId}/role`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    await throwApiError(
      response,
      "No se pudo actualizar el rol del usuario."
    );
  }

  return response.json();
}
export async function updateUserStatus(
  userId: number,
  data: UpdateUserStatusRequest
): Promise<UserResponse> {

  const response = await apiFetch(
    `/api/Users/${userId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    await throwApiError(
      response,
      "No se pudo actualizar el estado del usuario."
    );
  }

  return response.json();
}