import { useEffect, useState } from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getTicketById,
  deleteTicket,
} from "../services/ticketService";

import {
  useAuth,
} from "../contexts/AuthContext";

import {
  useToast,
} from "../contexts/ToastContext";

import {
  useConfirm,
} from "../contexts/ConfirmContext";

import type {
  TicketResponse,
  TicketPriority,
  TicketStatus as TicketStatusType,
} from "../types/ticket";

import TicketComments from "../components/TicketComments";
import TicketHistory from "../components/TicketHistory";
import TicketAssignment from "../components/TicketAssignment";
import TicketStatus from "../components/TicketStatus";

import {
  canEditTicket,
  canChangeTicketStatus,
  canAssignTicket,
} from "../utils/permissions";

function TicketDetailPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { user } = useAuth();

  const { showToast } = useToast();

  const { confirm } = useConfirm();

  // ========================================
  // ESTADOS DEL TICKET
  // ========================================

  const [ticket, setTicket] =
    useState<TicketResponse | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isDeleting, setIsDeleting] =
    useState(false);

  // ========================================
  // SEÑAL PARA ACTUALIZAR HISTORIAL
  // ========================================

  const [
    historyRefreshKey,
    setHistoryRefreshKey,
  ] = useState(0);

  // ========================================
  // PERMISOS DE INTERFAZ
  // ========================================

  const canEdit =
    user
      ? canEditTicket(user.role)
      : false;

  const canChangeStatus =
    user
      ? canChangeTicketStatus(user.role)
      : false;

  const canAssign =
    user
      ? canAssignTicket(user.role)
      : false;

  const canDelete =
    user
      ? user.role === "User" ||
        user.role === "Admin"
      : false;

  // ========================================
  // ELIMINAR TICKET
  // ========================================

  const handleDelete = async () => {
    if (!ticket) {
      return;
    }

    const confirmed =
      await confirm({
        title: "Eliminar ticket",
        message:
          `¿Deseas eliminar el ticket "${ticket.title}"? Esta acción lo enviará a tickets eliminados.`,
        confirmText:
          "Eliminar ticket",
        cancelText:
          "Cancelar",
        variant:
          "danger",
      });

    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);

      await deleteTicket(ticket.id);

      showToast(
        "Ticket eliminado correctamente.",
        "success"
      );

      navigate("/tickets");
    } catch (error) {
      console.error(
        "Error al eliminar ticket:",
        error
      );

      showToast(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el ticket.",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // ========================================
  // CLASE CSS DEL ESTADO
  // ========================================

  const getStatusClass = (
    status: TicketStatusType
  ) => {
    switch (status) {
      case "Open":
        return "ticket-status-open";

      case "In Progress":
        return "ticket-status-in-progress";

      case "Resolved":
        return "ticket-status-resolved";

      case "Closed":
        return "ticket-status-closed";

      default:
        return "";
    }
  };

  // ========================================
  // CLASE CSS DE LA PRIORIDAD
  // ========================================

  const getPriorityClass = (
    priority: TicketPriority
  ) => {
    switch (priority) {
      case "Low":
        return "ticket-priority-low";

      case "Medium":
        return "ticket-priority-medium";

      case "High":
        return "ticket-priority-high";

      case "Critical":
        return "ticket-priority-critical";

      default:
        return "";
    }
  };

  // ========================================
  // TICKET ACTUALIZADO
  // ========================================

  const handleTicketUpdated = (
    updatedTicket: TicketResponse
  ) => {
    setTicket(updatedTicket);

    setHistoryRefreshKey(
      (current) => current + 1
    );
  };

  // ========================================
  // CARGAR TICKET
  // ========================================

  useEffect(() => {
    const loadTicket = async () => {
      if (!id) {
        setErrorMessage(
          "No se proporcionó un ID de ticket."
        );

        return;
      }

      const ticketId = Number(id);

      if (Number.isNaN(ticketId)) {
        setErrorMessage(
          "El ID del ticket no es válido."
        );

        return;
      }

      try {
        setErrorMessage("");

        const result =
          await getTicketById(
            ticketId
          );

        setTicket(result);
      } catch (error) {
        console.error(
          "Error al cargar ticket:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Ocurrió un error al cargar el ticket."
        );
      }
    };

    loadTicket();
  }, [id]);

  // ========================================
  // ERROR DE CARGA
  // ========================================

  if (errorMessage) {
    return (
      <div className="ticket-detail-page">

        <div className="ticket-section-header">
          <h1>
            Detalle del ticket
          </h1>
        </div>

        <p className="error-message">
          {errorMessage}
        </p>

      </div>
    );
  }

  // ========================================
  // CARGANDO
  // ========================================

  if (!ticket) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />

        <p>
          Cargando ticket...
        </p>
      </div>
    );
  }

  // ========================================
  // JSX
  // ========================================

  return (
    <div className="ticket-detail-page">

      <section className="ticket-detail-card">

        <div className="ticket-detail-header">

          <div>
            <span className="ticket-number">
              Ticket #{ticket.id}
            </span>

            <h1>
              {ticket.title}
            </h1>
          </div>

          <div className="ticket-detail-actions">

            <span
              className={`
                ticket-status-badge
                ${getStatusClass(ticket.status)}
              `}
            >
              {ticket.status}
            </span>

            {canEdit && (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/tickets/${ticket.id}/edit`
                  )
                }
              >
                Editar ticket
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="delete-button"
                disabled={isDeleting}
              >
                {isDeleting
                  ? "Eliminando..."
                  : "Eliminar ticket"}
              </button>
            )}

          </div>
        </div>

        <div className="ticket-description">

          <span className="ticket-field-label">
            Descripción
          </span>

          <p>
            {ticket.description}
          </p>

        </div>

        <div className="ticket-info-grid">

          <div className="ticket-info-item">
            <span className="ticket-field-label">
              Prioridad
            </span>

            <span
              className={`
                ticket-priority-badge
                ${getPriorityClass(
                  ticket.priority
                )}
              `}
            >
              {ticket.priority}
            </span>
          </div>

          <div className="ticket-info-item">
            <span className="ticket-field-label">
              Categoría
            </span>

            <strong>
              {ticket.category?.name ??
                "Sin categoría"}
            </strong>
          </div>

          <div className="ticket-info-item">
            <span className="ticket-field-label">
              Creado por
            </span>

            <strong>
              {ticket.user?.name ??
                "No disponible"}
            </strong>
          </div>

          <div className="ticket-info-item">
            <span className="ticket-field-label">
              Asignado a
            </span>

            <strong>
              {ticket.assignedToUser?.name ??
                "Sin asignar"}
            </strong>
          </div>

          <div className="ticket-info-item">
            <span className="ticket-field-label">
              Fecha
            </span>

            <strong>
              {new Date(
                ticket.createdAt
              ).toLocaleString()}
            </strong>
          </div>

        </div>

      </section>

      {(canChangeStatus || canAssign) && (
        <section className="ticket-management-card">

          <div className="ticket-section-header">
            <h2>
              Gestión del ticket
            </h2>

            <p>
              Actualiza el estado o la
              asignación del ticket.
            </p>
          </div>

          <div className="ticket-management-grid">

            {canChangeStatus && (
              <div className="ticket-management-item">
                <TicketStatus
                  ticket={ticket}
                  onTicketUpdated={
                    handleTicketUpdated
                  }
                />
              </div>
            )}

            {canAssign && (
              <div className="ticket-management-item">
                <TicketAssignment
                  ticket={ticket}
                  onTicketUpdated={
                    handleTicketUpdated
                  }
                />
              </div>
            )}

          </div>

        </section>
      )}

      <TicketComments
        ticketId={ticket.id}
      />

      <TicketHistory
        ticketId={ticket.id}
        refreshKey={
          historyRefreshKey
        }
      />

    </div>
  );
}

export default TicketDetailPage;
