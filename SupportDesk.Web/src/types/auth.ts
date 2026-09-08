export type UserRole =
  | "User"
  | "Agent"
  | "Admin";

export interface AuthUser {
  userId: number;
  token: string;
  name: string;
  email: string;
  role: UserRole;
}