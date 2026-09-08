import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

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
    <div className="login-page">
      <div className="login-card">
        <h1>SupportDesk</h1>

        <p>
          Inicia sesión para continuar
        </p>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">
              Correo
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
              required
            />
          </div>

          <div>
            <label htmlFor="password">
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              placeholder="*********"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              disabled={isSubmitting}
              required
            />
          </div>

          {errorMessage && (
            <p className="login-error">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Iniciando sesión..."
              : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;