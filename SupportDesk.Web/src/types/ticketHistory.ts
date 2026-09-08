export interface TicketHistoryItem {
  id: number;
  ticketId: number;
  userId: number;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  } | null;
  fieldName: string | null;
}

export interface PagedTicketHistoryResponse {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  items: TicketHistoryItem[];
}