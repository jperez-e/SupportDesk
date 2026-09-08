import { useEffect, useState } from "react";

import { assignTicket } from "../services/ticketService";
import { getUsers } from "../services/userService";

import type { TicketResponse } from "../types/ticket";
import type { UserResponse } from "../types/user";

interface TicketAssignmentProps {
  ticket: TicketResponse;

  onTicketUpdated: (
    ticket: TicketResponse
  ) => void;
}

function TicketAssignment({
  ticket,
  onTicketUpdated,
}: TicketAssignmentProps) {
  const [agents, setAgents] =
    useState<UserResponse[]>([]);

  const [
    selectedAgentId,
    setSelectedAgentId,
  ] = useState(0);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  // ========================================
  // CARGAR AGENTES
  // ========================================

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const result =
          await getUsers();

        const availableAgents =
          result.filter(
            (user) =>
              user.role === "Agent" &&
              user.isActive
          );

        setAgents(
          availableAgents
        );
      } catch (error) {
        console.error(
          "Error al cargar agentes:",
          error
        );

        setErrorMessage(
          "No se pudieron cargar los agentes."
        );
      }
    };

    loadAgents();
  }, []);

  // ========================================
  // ASIGNAR TICKET
  // ========================================

  const handleAssignTicket =
    async () => {
      if (selectedAgentId === 0) {
        setErrorMessage(
          "Debe seleccionar un agente."
        );

        return;
      }

      try {
        setErrorMessage("");

        const updatedTicket =
          await assignTicket(
            ticket.id,
            {
              agentId:
                selectedAgentId,
            }
          );

        setSelectedAgentId(0);

        onTicketUpdated(
          updatedTicket
        );
      } catch (error) {
        console.error(
          "Error al asignar ticket:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Ocurrió un error al asignar el ticket."
        );
      }
    };

  return (
  <div className="ticket-management-control">
    <h3>Asignación</h3>

    <p className="ticket-management-current">
      Agente actual:
      <strong>
        {" "}
        {ticket.assignedToUser?.name ??
          "Sin asignar"}
      </strong>
    </p>

    {errorMessage && (
      <p className="form-error">
        {errorMessage}
      </p>
    )}

    <label>
      Asignar agente
    </label>

    <select
      value={selectedAgentId}
      onChange={(event) =>
        setSelectedAgentId(
          Number(event.target.value)
        )
      }
    >
      <option value={0}>
        Seleccionar agente
      </option>

      {agents.map((agent) => (
        <option
          key={agent.id}
          value={agent.id}
        >
          {agent.name}
        </option>
      ))}
    </select>

    <button
      type="button"
      onClick={handleAssignTicket}
    >
      Asignar agente
    </button>
  </div>
);
}

export default TicketAssignment;