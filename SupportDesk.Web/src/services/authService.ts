import {
  apiFetch,
} from "./apiClient";

import {
  throwApiError,
} from "./apiError";

import type {
  UserRole,
} from "../types/auth";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  token: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface CurrentUserResponse {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export async function login(
  data: LoginRequest
): Promise<LoginResponse> {
  const response =
    await apiFetch(
      "/api/Auth/login",
      {
        method: "POST",
        body: JSON.stringify(
          data
        ),
      }
    );

  if (!response.ok) {
    await throwApiError(
      response,
      "No se puede iniciar sesión."
    );
  }

  return response.json();
}

export async function getCurrentUser():
  Promise<CurrentUserResponse> {
  const response =
    await apiFetch(
      "/api/Auth/me",
      {
        method: "GET",
      }
    );

  if (!response.ok) {
    await throwApiError(
      response,
      "La sesión no es válida."
    );
  }

  return response.json();
}

export async function changePassword(
  data: ChangePasswordRequest
): Promise<LoginResponse> {
  const response =
    await apiFetch(
      "/api/Auth/change-password",
      {
        method: "PUT",
        body: JSON.stringify(
          data
        ),
      }
    );

  if (!response.ok) {
    await throwApiError(
      response,
      "No se pudo cambiar la contraseña."
    );
  }

  return response.json();
}
