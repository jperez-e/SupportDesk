export interface CreateCommentRequest {
  content: string;
  ticketId: number;
}

export interface CommentResponse {
  id: number;
  content: string;
  createdAt: string;
  ticketId: number;
  userId: number;
}

export interface CommentDetailResponse {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  } | null;
}