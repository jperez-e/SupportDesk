import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import LoginPage
  from "./pages/LoginPage";

import DashboardPage
  from "./pages/DashboardPage";

import TicketsPage
  from "./pages/TicketsPage";

import CreateTicketPage
  from "./pages/CreateTicketPage";

import EditTicketPage
  from "./pages/EditTicketPage";

import TicketDetailPage
  from "./pages/TicketDetailPage";

import UsersPage
  from "./pages/UsersPage";

import CategoriesPage
  from "./pages/CategoriesPage";

import DeletedTicketsPage
  from "./pages/DeletedTicketsPage";

import ProfilePage
  from "./pages/ProfilePage";

import NotFoundPage
  from "./pages/NotFoundPage";

import ProtectedRoute
  from "./components/ProtectedRoute";

import AppLayout
  from "./components/AppLayout";

import {
  useAuth,
} from "./contexts/AuthContext";

function App() {
  const {
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

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={
            isAuthenticated
              ? (
                <Navigate
                  to="/dashboard"
                  replace
                />
              )
              : (
                <LoginPage />
              )
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >

          <Route
            path="/dashboard"
            element={
              <DashboardPage />
            }
          />

          <Route
            path="/profile"
            element={
              <ProfilePage />
            }
          />

          <Route
            path="/tickets"
            element={
              <TicketsPage />
            }
          />

          <Route
            path="/tickets/create"
            element={
              <CreateTicketPage />
            }
          />

          <Route
            path="/tickets/:id/edit"
            element={
              <EditTicketPage />
            }
          />

          <Route
            path="/tickets/:id"
            element={
              <TicketDetailPage />
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Admin",
                ]}
              >
                <UsersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Admin",
                ]}
              >
                <CategoriesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/deleted-tickets"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Admin",
                ]}
              >
                <DeletedTicketsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <NotFoundPage />
            }
          />

        </Route>

        <Route
          path="/"
          element={
            <Navigate
              to={
                isAuthenticated
                  ? "/dashboard"
                  : "/login"
              }
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <NotFoundPage />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
