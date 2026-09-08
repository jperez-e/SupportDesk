import type {
  ReactNode,
} from "react";

import {
  Navigate,
} from "react-router-dom";

import type {
  UserRole,
} from "../types/auth";

import {
  useAuth,
} from "../contexts/AuthContext";

import AccessDeniedPage
  from "../pages/AccessDeniedPage";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const {
    user,
    isLoading,
    isAuthenticated,
  } = useAuth();

  if (isLoading) {
    return (
      <div className="dashboard-loading">

        <div className="loading-spinner" />

        <p>
          Validando sesión...
        </p>

      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    allowedRoles &&
    user &&
    !allowedRoles.includes(
      user.role
    )
  ) {
    return (
      <AccessDeniedPage />
    );
  }

  return children;
}

export default ProtectedRoute;