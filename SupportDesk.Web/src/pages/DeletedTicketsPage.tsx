import {
  useEffect,
  useState,
} from "react";

import {
  getDeletedTickets,
  restoreTicket,
} from "../services/ticketService";

import {
  useToast,
} from "../contexts/ToastContext";

import {
  useConfirm,
} from "../contexts/ConfirmContext";

import type {
  TicketResponse,
} from "../types/ticket";

function DeletedTicketsPage() {
  const [
    tickets,
    setTickets,
  ] = useState<TicketResponse[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    restoringTicketId,
    setRestoringTicketId,
  ] = useState<number | null>(null);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const { showToast } =
    useToast();

  const { confirm } =
    useConfirm();

  useEffect(() => {
    const loadDeletedTickets = async () => {
      try {
        setErrorMessage("");

        const result =
          await getDeletedTickets();

        setTickets(result);
      } catch (error) {
        console.error(
          "Error al cargar tickets eliminados:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los tickets eliminados."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDeletedTickets();
  }, []);

  const handleRestore = async (
    ticket: TicketResponse
  ) => {
    const confirmed =
      await confirm({
        title:
          "Restaurar ticket",
        message:
          `¿Deseas restaurar el ticket "${ticket.title}"? Volverá a aparecer en el listado de tickets activos.`,
        confirmText:
          "Restaurar ticket",
        cancelText:
          "Cancelar",
        variant:
          "default",
      });

    if (!confirmed) {
      return;
    }

    try {
      setRestoringTicketId(
        ticket.id
      );

      await restoreTicket(
        ticket.id
      );

      setTickets(
        (currentTickets) =>
          currentTickets.filter(
            (currentTicket) =>
              currentTicket.id !==
              ticket.id
          )
      );

      showToast(
        "Ticket restaurado correctamente.",
        "success"
      );
    } catch (error) {
      console.error(
        "Error al restaurar ticket:",
        error
      );

      showToast(
        error instanceof Error
          ? error.message
          : "No se pudo restaurar el ticket.",
        "error"
      );
    } finally {
      setRestoringTicketId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />

        <p>
          Cargando tickets eliminados...
        </p>
      </div>
    );
  }

  return (
    <div className="deleted-tickets-page">

      <div className="ticket-section-header">
        <h1>
          Tickets eliminados
        </h1>

        <p>
          Consulta y restaura tickets
          eliminados del sistema.
        </p>
      </div>

      {errorMessage && (
        <p className="error-message">
          {errorMessage}
        </p>
      )}

      {tickets.length === 0 ? (
        <div className="empty-state">
          <h3>
            No hay tickets eliminados
          </h3>

          <p>
            Los tickets eliminados aparecerán aquí
            y podrán restaurarse cuando sea necesario.
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
                  Título
                </th>

                <th>
                  Prioridad
                </th>

                <th>
                  Categoría
                </th>

                <th>
                  Creado por
                </th>

                <th>
                  Acción
                </th>
              </tr>
            </thead>

            <tbody>

              {tickets.map(
                (ticket) => (
                  <tr key={ticket.id}>

                    <td>
                      {ticket.id}
                    </td>

                    <td>
                      {ticket.title}
                    </td>

                    <td>
                      {ticket.priority}
                    </td>

                    <td>
                      {ticket.category?.name ??
                        "Sin categoría"}
                    </td>

                    <td>
                      {ticket.user?.name ??
                        "No disponible"}
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          handleRestore(
                            ticket
                          )
                        }
                        disabled={
                          restoringTicketId ===
                          ticket.id
                        }
                      >
                        {restoringTicketId ===
                        ticket.id
                          ? "Restaurando..."
                          : "Restaurar"}
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

export default DeletedTicketsPage;
