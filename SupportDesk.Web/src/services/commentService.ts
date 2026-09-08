import type {
  CommentDetailResponse,
  CommentResponse,
  CreateCommentRequest,
} from "../types/comment";

import { apiFetch } from "./apiClient";
import { throwApiError } from "./apiError";

// ========================================
// OBTENER COMENTARIOS DE UN TICKET
// ========================================

export async function getCommentsByTicket(
  ticketId: number
): Promise<CommentDetailResponse[]> {

  const response = await apiFetch(
    `/api/Comments/ticket/${ticketId}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    await throwApiError(
      response,
      "No se pudieron cargar los comentarios."
    );
  }

  return response.json();
}

// ========================================
// CREAR COMENTARIO
// ========================================

export async function createComment(
  data: CreateCommentRequest
): Promise<CommentResponse> {

  const response = await apiFetch(
    "/api/Comments",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    await throwApiError(
      response,
      "No se pudo crear el comentario."
    );
  }

  return response.json();
}

// ========================================
// ELIMINAR COMENTARIO
// ========================================

export async function deleteComment(
  id: number
): Promise<void> {

  const response = await apiFetch(
    `/api/Comments/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    await throwApiError(
      response,
      "No se pudo eliminar el comentario."
    );
  }
}