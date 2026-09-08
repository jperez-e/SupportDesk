import { useState } from "react";

import {
  updateTicketStatus,
} from "../services/ticketService";

import type {
  TicketResponse,
  TicketStatus as TicketStatusType,
} from "../types/ticket";

interface TicketStatusProps {
  ticket: TicketResponse;

  onTicketUpdated: (
    ticket: TicketResponse
  ) => void;
}

function TicketStatus({
  ticket,
  onTicketUpdated,
}: TicketStatusProps) {
  const [newStatus, setNewStatus] =
    useState<TicketStatusType | "">("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  // ========================================
  // TRANSICIONES PERMITIDAS
  // ========================================

  const getAllowedStatuses = (
    currentStatus: TicketStatusType
  ): TicketStatusType[] => {
    switch (currentStatus) {
      case "Open":
        return [
          "In Progress",
        ];

      case "In Progress":
        return [
          "Resolved",
        ];

      case "Resolved":
        return [
          "Closed",
          "In Progress",
        ];

      case "Closed":
        return [];

      default:
        return [];
    }
  };

  const allowedStatuses =
    getAllowedStatuses(
      ticket.status
    );

  // ========================================
  // CAMBIAR ESTADO
  // ========================================

  const handleStatusChange =
    async () => {
      if (!newStatus) {
        return;
      }

      try {
        setErrorMessage("");

        const updatedTicket =
          await updateTicketStatus(
            ticket.id,
            {
              status: newStatus,
            }
          );

        setNewStatus("");

        onTicketUpdated(
          updatedTicket
        );
      } catch (error) {
        console.error(
          "Error al actualizar estado:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Ocurrió un error al actualizar el estado."
        );
      }
    };

  return (
    <div className="ticket-management-control">
      <h3>
        Estado
      </h3>

      <p className="ticket-management-current">
        Estado actual:
        <strong>
          {" "}
          {ticket.status}
        </strong>
      </p>

      {errorMessage && (
        <p className="form-error">
          {errorMessage}
        </p>
      )}

      {allowedStatuses.length > 0 ? (
        <>
          <label htmlFor="newStatus">
            Nuevo estado
          </label>

          <select
            id="newStatus"
            value={newStatus}
            onChange={(event) =>
              setNewStatus(
                event.target
                  .value as
                  | TicketStatusType
                  | ""
              )
            }
          >
            <option value="">
              Seleccionar estado
            </option>

            {allowedStatuses.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}
          </select>

          <button
            type="button"
            onClick={
              handleStatusChange
            }
          >
            Actualizar estado
          </button>
        </>
      ) : (
        <p className="ticket-management-muted">
          Este ticket no tiene más
          transiciones disponibles.
        </p>
      )}
    </div>
  );
}

export default TicketStatus;