import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    try {
      setErrorMessage("");
      setIsSubmitting(true);

      const result = await login({
        email,
        password,
      });

      loginUser(result);

      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Error de login:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar sesión."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-visual">
          <div className="login-brand">
            <div className="login-brand-icon">
              SD
            </div>

            <div>
              <h1>SupportDesk</h1>
              <p>
                Gestión de soporte técnico
              </p>
            </div>
          </div>

          <div className="login-visual-content">
            <span className="login-eyebrow">
              SERVICE MANAGEMENT
            </span>

            <h2>
              Gestiona solicitudes de soporte
              de forma clara y eficiente.
            </h2>

            <p>
              Centraliza tickets, asignaciones,
              seguimiento, historial y métricas
              desde una sola plataforma.
            </p>

            <div className="login-feature-list">
              <div className="login-feature-item">
                <span>✓</span>
                Gestión centralizada de tickets
              </div>

              <div className="login-feature-item">
                <span>✓</span>
                Roles y permisos seguros
              </div>

              <div className="login-feature-item">
                <span>✓</span>
                Historial y métricas operativas
              </div>
            </div>
          </div>

          <div className="login-visual-footer">
            SupportDesk · Service Management
          </div>
        </div>

        <div className="login-form-panel">
          <div className="login-card">
            <div className="login-mobile-brand">
              <div className="login-brand-icon">
                SD
              </div>

              <div>
                <strong>SupportDesk</strong>
                <span>
                  Service Management
                </span>
              </div>
            </div>

            <div className="login-card-header">
              <span className="login-card-kicker">
                BIENVENIDO
              </span>

              <h2>Inicia sesión</h2>

              <p>
                Ingresa tus credenciales para
                acceder a tu espacio de trabajo.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="login-form"
            >
              <div className="login-field">
                <label htmlFor="email">
                  Correo electrónico
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  disabled={isSubmitting}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="login-field">
                <label htmlFor="password">
                  Contraseña
                </label>

                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  disabled={isSubmitting}
                  autoComplete="current-password"
                  required
                />
              </div>

              {errorMessage && (
                <div className="login-error">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="login-submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Iniciando sesión..."
                  : "Iniciar sesión"}
              </button>
            </form>

            <p className="login-security-note">
              Acceso protegido mediante
              autenticación segura.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;