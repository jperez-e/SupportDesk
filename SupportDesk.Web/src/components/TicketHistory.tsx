import { useEffect, useState } from "react";

import {
  getTicketHistory,
} from "../services/ticketService";

import type {
  TicketHistoryItem,
} from "../types/ticketHistory";

interface TicketHistoryProps {
  ticketId: number;
  refreshKey: number;
}

function TicketHistory({
  ticketId,
  refreshKey,
}: TicketHistoryProps) {
  const [history, setHistory] =
    useState<TicketHistoryItem[]>([]);

  const [historyPage, setHistoryPage] =
    useState(1);

  const [
    historyTotalPages,
    setHistoryTotalPages,
  ] = useState(1);

  const [
    historyTotalCount,
    setHistoryTotalCount,
  ] = useState(0);

  // ========================================
  // CARGAR HISTORIAL
  // ========================================

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const result =
          await getTicketHistory(
            ticketId,
            historyPage,
            10
          );

        setHistory(result.items);

        setHistoryTotalPages(
          result.totalPages
        );

        setHistoryTotalCount(
          result.totalCount
        );
      } catch (error) {
        console.error(
          "Error al cargar historial:",
          error
        );
      }
    };

    loadHistory();
  }, [
    ticketId,
    historyPage,
    refreshKey,
  ]);

  const getHistoryDescription = (
  item: TicketHistoryItem
) => {
  switch (item.action) {
    case "Created":
      return "creó el ticket";

    case "StatusChanged":
      return `cambió el estado de ${
        item.oldValue ?? "Sin estado"
      } a ${
        item.newValue ?? "Sin estado"
      }`;

    case "Assigned":
      return `asignó el ticket a ${
        item.newValue ?? "un agente"
      }`;

    case "Reassigned":
      return `reasignó el ticket de ${
        item.oldValue ?? "Sin asignar"
      } a ${
        item.newValue ?? "Sin asignar"
      }`;

    case "Unassigned":
      return `quitó la asignación de ${
        item.oldValue ?? "un agente"
      }`;

    case "Updated":
      if (item.fieldName) {
        return `actualizó ${item.fieldName}`;
      }

      return "actualizó el ticket";

    case "Deleted":
      return "eliminó el ticket";

    case "Restored":
      return "restauró el ticket";

    default:
      return item.action;
  }
};

return (
  <section className="ticket-history-card">
    <div className="ticket-section-header">
      <h2>Historial</h2>

      <p>
        Cambios realizados sobre este ticket.
      </p>
    </div>

    {history.length === 0 ? (
      <p className="ticket-empty-message">
        No hay movimientos registrados.
      </p>
    ) : (
      <div className="ticket-history-list">
        {history.map((item) => (
          <article
            key={item.id}
            className="ticket-history-item"
          >
            <div className="ticket-history-marker">
              <span />
            </div>

            <div className="ticket-history-content">
              <div className="ticket-history-top">
                <strong>
                  {item.user?.name ??
                    "Usuario desconocido"}
                </strong>

                <span>
                  {new Date(
                    item.createdAt
                  ).toLocaleString()}
                </span>
              </div>

              <p>
                {getHistoryDescription(item)}
              </p>
            </div>
          </article>
        ))}
      </div>
    )}

    {historyTotalPages > 1 && (
      <div className="ticket-history-pagination">
        <button
          type="button"
          disabled={historyPage === 1}
          onClick={() =>
            setHistoryPage(
              (current) => current - 1
            )
          }
        >
          Anterior
        </button>

        <span>
          Página {historyPage} de{" "}
          {historyTotalPages}
        </span>

        <button
          type="button"
          disabled={
            historyPage ===
            historyTotalPages
          }
          onClick={() =>
            setHistoryPage(
              (current) => current + 1
            )
          }
        >
          Siguiente
        </button>
      </div>
    )}

    <p className="ticket-history-total">
      {historyTotalCount} movimiento
      {historyTotalCount === 1 ? "" : "s"}
    </p>
  </section>
);
}

export default TicketHistory;