import type {
  UserResponse,
} from "./user";

import type {
  Category,
} from "./category";

// ========================================
// TIPOS DE TICKET
// ========================================

export type TicketPriority =
  | "Low"
  | "Medium"
  | "High"
  | "Critical";

export type TicketStatus =
  | "Open"
  | "In Progress"
  | "Resolved"
  | "Closed";

export type TicketSortBy =
  | "Id"
  | "Title"
  | "Priority"
  | "Status"
  | "CreatedAt";

// ========================================
// CREAR TICKET
// ========================================

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: TicketPriority;
  categoryId: number;
}

// ========================================
// RESPUESTA DE TICKET
// ========================================

export interface TicketResponse {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;

  user: UserResponse | null;

  category: Category | null;

  assignedToUser: UserResponse | null;
}

// ========================================
// RESPUESTA PAGINADA
// ========================================

export interface PagedTicketsResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: TicketResponse[];
}

// ========================================
// FILTROS Y CONSULTAS
// ========================================

export interface TicketQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  categoryId?: number;
  sortBy?: TicketSortBy;
  descending?: boolean;
}

// ========================================
// ACTUALIZAR ESTADO
// ========================================

export interface UpdateTicketStatusRequest {
  status: TicketStatus;
}

// ========================================
// ASIGNAR TICKET
// ========================================

export interface AssignTicketRequest {
  agentId: number;
}

export interface UpdateTicketRequest {
  title: string;
  description: string;
  priority: TicketPriority;
  categoryId: number;
}