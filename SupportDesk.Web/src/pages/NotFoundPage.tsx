import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../contexts/AuthContext";

function NotFoundPage() {
  const navigate =
    useNavigate();

  const {
    isAuthenticated,
  } = useAuth();

  return (
    <div className="system-page">

      <div className="system-page-card">

        <div className="system-page-code">
          404
        </div>

        <div className="system-page-icon">
          ?
        </div>

        <h1>
          Página no encontrada
        </h1>

        <p>
          La dirección que intentaste
          visitar no existe o pudo haber
          sido modificada.
        </p>

        <div className="system-page-actions">

          <button
            type="button"
            onClick={() =>
              navigate(
                isAuthenticated
                  ? "/dashboard"
                  : "/login"
              )
            }
          >
            {isAuthenticated
              ? "Ir al Dashboard"
              : "Ir al inicio de sesión"}
          </button>

          <button
            type="button"
            className="system-page-secondary"
            onClick={() =>
              navigate(-1)
            }
          >
            Volver
          </button>

        </div>

      </div>

    </div>
  );
}

export default NotFoundPage;