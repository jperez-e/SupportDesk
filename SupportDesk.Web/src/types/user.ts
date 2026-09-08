import type {
  UserRole,
} from "./auth";

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}