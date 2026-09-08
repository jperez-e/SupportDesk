import {
  useEffect,
  useState,
} from "react";

import {
  getUsers,
  updateUserRole,
  updateUserStatus,
} from "../services/userService";

import {
  useToast,
} from "../contexts/ToastContext";

import {
  useConfirm,
} from "../contexts/ConfirmContext";

import type {
  UserResponse,
} from "../types/user";

import type {
  UserRole,
} from "../types/auth";

function UsersPage() {
  const [
    users,
    setUsers,
  ] = useState<UserResponse[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    updatingUserId,
    setUpdatingUserId,
  ] = useState<number | null>(null);

  const { showToast } =
    useToast();

  const { confirm } =
    useConfirm();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setErrorMessage("");

        const result =
          await getUsers();

        setUsers(result);
      } catch (error) {
        console.error(
          "Error al cargar usuarios:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los usuarios."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleRoleChange = async (
    userId: number,
    role: UserRole
  ) => {
    const currentUser =
      users.find(
        (user) =>
          user.id === userId
      );

    if (!currentUser) {
      return;
    }

    if (currentUser.role === role) {
      return;
    }

    const confirmed =
      await confirm({
        title:
          "Cambiar rol",
        message:
          `¿Deseas cambiar el rol de "${currentUser.name}" de ${currentUser.role} a ${role}?`,
        confirmText:
          "Cambiar rol",
        cancelText:
          "Cancelar",
        variant:
          "warning",
      });

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingUserId(userId);
      setErrorMessage("");

      const updatedUser =
        await updateUserRole(
          userId,
          { role }
        );

      setUsers(
        (currentUsers) =>
          currentUsers.map(
            (user) =>
              user.id === userId
                ? updatedUser
                : user
          )
      );

      showToast(
        "Rol actualizado correctamente.",
        "success"
      );
    } catch (error) {
      console.error(
        "Error al cambiar rol:",
        error
      );

      showToast(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el rol.",
        "error"
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleStatusChange = async (
    user: UserResponse
  ) => {
    const newStatus =
      !user.isActive;

    const confirmed =
      await confirm({
        title:
          newStatus
            ? "Activar usuario"
            : "Desactivar usuario",
        message:
          newStatus
            ? `¿Deseas activar al usuario "${user.name}"?`
            : `¿Deseas desactivar al usuario "${user.name}"? Perderá el acceso al sistema.`,
        confirmText:
          newStatus
            ? "Activar usuario"
            : "Desactivar usuario",
        cancelText:
          "Cancelar",
        variant:
          newStatus
            ? "default"
            : "danger",
      });

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingUserId(user.id);
      setErrorMessage("");

      const updatedUser =
        await updateUserStatus(
          user.id,
          {
            isActive:
              newStatus,
          }
        );

      setUsers(
        (currentUsers) =>
          currentUsers.map(
            (currentUser) =>
              currentUser.id === user.id
                ? updatedUser
                : currentUser
          )
      );

      showToast(
        newStatus
          ? "Usuario activado correctamente."
          : "Usuario desactivado correctamente.",
        "success"
      );
    } catch (error) {
      console.error(
        "Error al cambiar estado:",
        error
      );

      showToast(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el estado del usuario.",
        "error"
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />

        <p>
          Cargando usuarios...
        </p>
      </div>
    );
  }

  return (
    <div className="users-page">

      <div className="ticket-section-header">
        <h1>
          Gestión de usuarios
        </h1>

        <p>
          Administra los usuarios
          registrados en SupportDesk.
        </p>
      </div>

      {errorMessage && (
        <p className="error-message">
          {errorMessage}
        </p>
      )}

      {users.length === 0 ? (
        <div className="empty-state">
          <h3>
            No hay usuarios
          </h3>

          <p>
            No se encontraron usuarios registrados.
          </p>
        </div>
      ) : (
        <div className="users-table-container">

          <table className="users-table">

            <thead>
              <tr>
                <th>
                  ID
                </th>

                <th>
                  Nombre
                </th>

                <th>
                  Correo
                </th>

                <th>
                  Rol
                </th>

                <th>
                  Estado
                </th>

                <th>
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>

              {users.map(
                (user) => (
                  <tr key={user.id}>

                    <td>
                      {user.id}
                    </td>

                    <td>
                      {user.name}
                    </td>

                    <td>
                      {user.email}
                    </td>

                    <td>
                      <select
                        value={user.role}
                        onChange={(event) =>
                          handleRoleChange(
                            user.id,
                            event.target
                              .value as UserRole
                          )
                        }
                        disabled={
                          updatingUserId ===
                          user.id
                        }
                      >
                        <option value="User">
                          User
                        </option>

                        <option value="Agent">
                          Agent
                        </option>

                        <option value="Admin">
                          Admin
                        </option>
                      </select>
                    </td>

                    <td>
                      <span
                        className={
                          user.isActive
                            ? "status-active"
                            : "status-inactive"
                        }
                      >
                        {user.isActive
                          ? "Activo"
                          : "Inactivo"}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(
                            user
                          )
                        }
                        disabled={
                          updatingUserId ===
                          user.id
                        }
                      >
                        {updatingUserId ===
                        user.id
                          ? "Actualizando..."
                          : user.isActive
                            ? "Desactivar"
                            : "Activar"}
                      </button>
                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}

export default UsersPage;
