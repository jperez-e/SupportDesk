import type {
  UserRole,
} from "../types/auth";

export function canEditTicket(
  role: UserRole
): boolean {
  return (
    role === "User" ||
    role === "Agent" ||
    role === "Admin"
  );
}

export function canChangeTicketStatus(
  role: UserRole
): boolean {
  return (
    role === "Agent" ||
    role === "Admin"
  );
}

export function canAssignTicket(
  role: UserRole
): boolean {
  return role === "Admin";
}

export function canManageUsers(
  role: UserRole
): boolean {
  return role === "Admin";
}

export function canManageCategories(
  role: UserRole
): boolean {
  return role === "Admin";
}

export function canViewDeletedTickets(
  role: UserRole
): boolean {
  return role === "Admin";
}