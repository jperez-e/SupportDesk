import {
  useNavigate,
} from "react-router-dom";

function AccessDeniedPage() {
  const navigate =
    useNavigate();

  return (
    <div className="system-page">

      <div className="system-page-card">

        <div className="system-page-code">
          403
        </div>

        <div className="system-page-icon">
          !
        </div>

        <h1>
          Acceso denegado
        </h1>

        <p>
          No tienes permisos para acceder
          a esta sección de SupportDesk.
        </p>

        <div className="system-page-actions">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
          >
            Ir al Dashboard
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

export default AccessDeniedPage;