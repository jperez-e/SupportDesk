import {
  useState,
} from "react";

import {
  changePassword,
} from "../services/authService";

import {
  useAuth,
} from "../contexts/AuthContext";

import {
  useToast,
} from "../contexts/ToastContext";

function ProfilePage() {
  const {
    user,
    loginUser,
  } = useAuth();

  const {
    showToast,
  } = useToast();

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const userInitials =
    user?.name
      ? user.name
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map(
            (part) =>
              part
                .charAt(0)
                .toUpperCase()
          )
          .join("")
      : "SD";

  const roleLabel =
    user?.role === "Admin"
      ? "Administrador"
      : user?.role === "Agent"
        ? "Agente"
        : "Usuario";

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setErrorMessage("");

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setErrorMessage(
        "Debes completar todos los campos."
      );
      return;
    }

    if (
      newPassword.length < 8
    ) {
      setErrorMessage(
        "La nueva contraseña debe tener al menos 8 caracteres."
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setErrorMessage(
        "La confirmación de la contraseña no coincide."
      );
      return;
    }

    if (
      currentPassword ===
      newPassword
    ) {
      setErrorMessage(
        "La nueva contraseña debe ser diferente de la actual."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const updatedAuth =
        await changePassword({
          currentPassword,
          newPassword,
          confirmPassword,
        });

      // Guarda el JWT nuevo devuelto por el backend.
      loginUser(updatedAuth);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      showToast(
        "Contraseña actualizada correctamente.",
        "success"
      );
    } catch (error) {
      console.error(
        "Error al cambiar contraseña:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "No se pudo cambiar la contraseña.";

      setErrorMessage(message);

      showToast(
        message,
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-page">

      <div className="ticket-section-header">
        <h1>
          Mi perfil
        </h1>

        <p>
          Consulta tu información
          y administra la seguridad
          de tu cuenta.
        </p>
      </div>

      <div className="profile-grid">

        <section className="profile-card">

          <div className="profile-avatar">
            {userInitials}
          </div>

          <div className="profile-identity">
            <h2>
              {user?.name}
            </h2>

            <p>
              {user?.email}
            </p>

            <span className="profile-role">
              {roleLabel}
            </span>
          </div>

          <div className="profile-data">

            <div className="profile-data-item">
              <span>
                ID de usuario
              </span>

              <strong>
                {user?.userId}
              </strong>
            </div>

            <div className="profile-data-item">
              <span>
                Nombre
              </span>

              <strong>
                {user?.name}
              </strong>
            </div>

            <div className="profile-data-item">
              <span>
                Correo electrónico
              </span>

              <strong>
                {user?.email}
              </strong>
            </div>

            <div className="profile-data-item">
              <span>
                Rol
              </span>

              <strong>
                {roleLabel}
              </strong>
            </div>

          </div>

        </section>

        <section className="ticket-form-card">

          <div className="ticket-section-header">
            <h2>
              Cambiar contraseña
            </h2>

            <p>
              Al cambiarla, los tokens
              anteriores dejarán de ser válidos.
            </p>
          </div>

          {errorMessage && (
            <p className="error-message">
              {errorMessage}
            </p>
          )}

          <form
            onSubmit={
              handleSubmit
            }
          >

            <div className="form-group">
              <label htmlFor="currentPassword">
                Contraseña actual
              </label>

              <input
                id="currentPassword"
                type="password"
                value={
                  currentPassword
                }
                onChange={
                  (event) =>
                    setCurrentPassword(
                      event.target.value
                    )
                }
                autoComplete="current-password"
                disabled={
                  isSubmitting
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">
                Nueva contraseña
              </label>

              <input
                id="newPassword"
                type="password"
                value={
                  newPassword
                }
                onChange={
                  (event) =>
                    setNewPassword(
                      event.target.value
                    )
                }
                autoComplete="new-password"
                disabled={
                  isSubmitting
                }
              />

              <small>
                Mínimo 8 caracteres.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirmar nueva contraseña
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={
                  confirmPassword
                }
                onChange={
                  (event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                }
                autoComplete="new-password"
                disabled={
                  isSubmitting
                }
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={
                  isSubmitting
                }
              >
                {isSubmitting
                  ? "Actualizando..."
                  : "Cambiar contraseña"}
              </button>
            </div>

          </form>

        </section>

      </div>

    </div>
  );
}

export default ProfilePage;
