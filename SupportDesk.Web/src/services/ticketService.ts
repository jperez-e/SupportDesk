import type {
  CreateTicketRequest,
  PagedTicketsResponse,
  TicketQueryParams,
  TicketResponse,
  UpdateTicketStatusRequest,
  AssignTicketRequest,
    UpdateTicketRequest,
} from "../types/ticket";

import type {
  PagedTicketHistoryResponse,
} from "../types/ticketHistory";

import { apiFetch } from "./apiClient";
import { throwApiError } from "./apiError";

// ========================================
// CREAR TICKET
// ========================================

export async function createTicket(
  data: CreateTicketRequest
): Promise<TicketResponse> {
  const response = await apiFetch(
    "/api/Tickets",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    await throwApiError(
      response,
      "No se pudo crear el ticket."
    );
  }

  return response.json();
}

// ========================================
// OBTENER TICKETS
// ========================================

export async function getTickets(
  params: TicketQueryParams = {}
): Promise<PagedTicketsResponse> {
  const queryParams =
    new URLSearchParams();

  if (params.page) {
    queryParams.append(
      "page",
      params.page.toString()
    );
  }

  if (params.pageSize) {
    queryParams.append(
      "pageSize",
      params.pageSize.toString()
    );
  }

  if (params.search) {
    queryParams.append(
      "search",
      params.search
    );
  }

  if (params.status) {
    queryParams.append(
      "status",
      params.status
    );
  }

  if (params.priority) {
    queryParams.append(
      "priority",
      params.priority
    );
  }

  if (params.categoryId) {
    queryParams.append(
      "categoryId",
      params.categoryId.toString()
    );
  }

  if (params.sortBy) {
    queryParams.append(
      "sortBy",
      params.sortBy
    );
  }

  if (
    params.descending !== undefined
  ) {
    queryParams.append(
      "descending",
      params.descending.toString()
    );
  }

  const queryString =
    queryParams.toString();

  const endpoint =
    queryString
      ? `/api/Tickets?${queryString}`
      : "/api/Tickets";

  const response = await apiFetch(
    endpoint,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    await throwApiError(
      response,
      "No se pudieron cargar los tickets."
    );
  }

  return response.json();
}

// ========================================
// OBTENER TICKET POR ID
// ========================================

export async function getTicketById(
  id: number
): Promise<TicketResponse> {
  const response = await apiFetch(
    `/api/Tickets/${id}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    await throwApiError(
      response,
      "No se pudo cargar el ticket."
    );
  }

  return response.json();
}

// ========================================
// ACTUALIZAR ESTADO
// ========================================

export async function updateTicketStatus(
  id: number,
  data: UpdateTicketStatusRequest
): Promise<TicketResponse> {
  const response = await apiFetch(
    `/api/Tickets/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    await throwApiError(
      response,
      "No se pudo actualizar el estado del ticket."
    );
  }

  return response.json();
}

// ========================================
// ASIGNAR TICKET
// ========================================

export async function assignTicket(
  id: number,
  data: AssignTicketRequest
): Promise<TicketResponse> {
  const response = await apiFetch(
    `/api/Tickets/${id}/assign`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    await throwApiError(
      response,
      "No se pudo asignar el ticket."
    );
  }

  return response.json();
}

// ========================================
// OBTENER HISTORIAL DEL TICKET
// ========================================

export async function getTicketHistory(
  ticketId: number,
  page = 1,
  pageSize = 10
): Promise<PagedTicketHistoryResponse> {
  const queryParams =
    new URLSearchParams();

  queryParams.set(
    "page",
    String(page)
  );

  queryParams.set(
    "pageSize",
    String(pageSize)
  );

  const response = await apiFetch(
    `/api/Tickets/${ticketId}/history?${queryParams.toString()}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      await throwApiError(
        response,
        "No se pudo encontrar el historial del ticket."
      );
    }

    if (response.status === 403) {
      await throwApiError(
        response,
        "No tienes permisos para consultar el historial de este ticket."
      );
    }

    await throwApiError(
      response,
      "No se pudo cargar el historial del ticket."
    );
  }

  return response.json();
}
export async function updateTicket(
  id: number,
  data: UpdateTicketRequest
): Promise<TicketResponse> {

  const response = await apiFetch(
    `/api/Tickets/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    await throwApiError(
      response,
      "No se pudo actualizar el ticket."
    );
  }

  return response.json();
}

export async function getDeletedTickets():
  Promise<TicketResponse[]> {

  const response = await apiFetch(
    "/api/Tickets/deleted",
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    await throwApiError(
      response,
      "No se pudieron cargar los tickets eliminados."
    );
  }

  return response.json();
}

export async function restoreTicket(
  id: number
): Promise<TicketResponse> {

  const response = await apiFetch(
    `/api/Tickets/${id}/restore`,
    {
      method: "PATCH",
    }
  );

  if (!response.ok) {
    await throwApiError(
      response,
      "No se pudo restaurar el ticket."
    );
  }

  return response.json();
}

export async function deleteTicket(
  id: number
): Promise<void> {
  const response = await apiFetch(
    `/api/Tickets/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    await throwApiError(
      response,
      "No se pudo eliminar el ticket."
    );
  }
}