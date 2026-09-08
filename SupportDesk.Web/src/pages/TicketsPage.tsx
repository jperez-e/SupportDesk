import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getTickets,
} from "../services/ticketService";

import {
  getCategories,
} from "../services/categoryService";

import type {
  TicketResponse,
  TicketStatus,
  TicketPriority,
  TicketSortBy,
} from "../types/ticket";

import type {
  Category,
} from "../types/category";

function TicketsPage() {
  const [tickets, setTickets] =
    useState<TicketResponse[]>([]);

  const [page, setPage] =
    useState(1);

  const [search, setSearch] =
    useState("");

  const [searchFilter, setSearchFilter] =
    useState("");

  const [totalPages, setTotalPages] =
    useState(1);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [status, setStatus] =
    useState<TicketStatus | "">("");

  const [priority, setPriority] =
    useState<TicketPriority | "">("");

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [categoryId, setCategoryId] =
    useState(0);

  const [sortBy, setSortBy] =
    useState<TicketSortBy>("Id");

  const [descending, setDescending] =
    useState(false);

  // ========================================
  // CARGAR TICKETS
  // ========================================

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setErrorMessage("");

        const result =
          await getTickets({
            page,
            pageSize: 10,
            search: searchFilter,

            status:
              status === ""
                ? undefined
                : status,

            priority:
              priority === ""
                ? undefined
                : priority,

            categoryId:
              categoryId === 0
                ? undefined
                : categoryId,

            sortBy,
            descending,
          });

        setTickets(
          result.items
        );

        setTotalPages(
          result.totalPages
        );
      } catch (error) {
        console.error(
          "Error al cargar tickets:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Ocurrió un error al cargar los tickets."
        );
      }
    };

    loadTickets();
  }, [
    page,
    searchFilter,
    status,
    priority,
    categoryId,
    sortBy,
    descending,
  ]);

  // ========================================
  // CARGAR CATEGORÍAS
  // ========================================

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result =
          await getCategories();

        setCategories(
          result
        );
      } catch (error) {
        console.error(
          "Error al cargar categorías:",
          error
        );
      }
    };

    loadCategories();
  }, []);

  // ========================================
  // JSX
  // ========================================

  return (
    <div className="tickets-page">

      {/* =========================
          FILTROS
          ========================= */}

      <div className="tickets-filters">

        {/* BUSCAR */}

        <div>
          <label htmlFor="search">
            Buscar
          </label>

          <input
            id="search"
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          <button
            type="button"
            onClick={() => {
              setPage(1);

              setSearchFilter(
                search.trim()
              );
            }}
          >
            Buscar
          </button>
        </div>

        {/* ESTADO */}

        <div>
          <label htmlFor="status">
            Estado
          </label>

          <select
            id="status"
            value={status}
            onChange={(event) => {
              setPage(1);

              setStatus(
                event.target
                  .value as
                  | TicketStatus
                  | ""
              );
            }}
          >
            <option value="">
              Todos
            </option>

            <option value="Open">
              Abierto
            </option>

            <option value="In Progress">
              En progreso
            </option>

            <option value="Resolved">
              Resuelto
            </option>

            <option value="Closed">
              Cerrado
            </option>
          </select>
        </div>

        {/* PRIORIDAD */}

        <div>
          <label htmlFor="priority">
            Prioridad
          </label>

          <select
            id="priority"
            value={priority}
            onChange={(event) => {
              setPage(1);

              setPriority(
                event.target
                  .value as
                  | TicketPriority
                  | ""
              );
            }}
          >
            <option value="">
              Todas
            </option>

            <option value="Low">
              Baja
            </option>

            <option value="Medium">
              Media
            </option>

            <option value="High">
              Alta
            </option>

            <option value="Critical">
              Crítica
            </option>
          </select>
        </div>

        {/* CATEGORÍA */}

        <div>
          <label htmlFor="category">
            Categoría
          </label>

          <select
            id="category"
            value={categoryId}
            onChange={(event) => {
              setPage(1);

              setCategoryId(
                Number(
                  event.target.value
                )
              );
            }}
          >
            <option value={0}>
              Todas
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              )
            )}
          </select>
        </div>

        {/* ORDENAR POR */}

        <div>
          <label htmlFor="sortBy">
            Ordenar por
          </label>

          <select
            id="sortBy"
            value={sortBy}
            onChange={(event) => {
              setPage(1);

              setSortBy(
                event.target
                  .value as TicketSortBy
              );
            }}
          >
            <option value="Id">
              ID
            </option>

            <option value="Title">
              Título
            </option>

            <option value="Priority">
              Prioridad
            </option>

            <option value="Status">
              Estado
            </option>

            <option value="CreatedAt">
              Fecha de creación
            </option>
          </select>
        </div>

        {/* ORDEN */}

        <div>
          <label htmlFor="descending">
            Orden
          </label>

          <select
            id="descending"
            value={
              String(descending)
            }
            onChange={(event) => {
              setPage(1);

              setDescending(
                event.target.value ===
                  "true"
              );
            }}
          >
            <option value="false">
              Ascendente
            </option>

            <option value="true">
              Descendente
            </option>
          </select>
        </div>

      </div>

      {/* =========================
          TÍTULO
          ========================= */}

      <h1>
        Tickets
      </h1>

      {/* =========================
          ERROR
          ========================= */}

      {errorMessage && (
        <p>
          {errorMessage}
        </p>
      )}

      {/* =========================
          TABLA
          ========================= */}

      {tickets.length === 0 &&
      !errorMessage ? (
        <p>
          No hay tickets disponibles.
        </p>
      ) : (
        <div className="tickets-table-container">

          <table className="tickets-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Categoría</th>
                <th>Creado por</th>
                <th>Asignado a</th>
                <th>Fecha</th>
                <th>Acciones</th>
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
                      {ticket.status}
                    </td>

                    <td>
                      {ticket.priority}
                    </td>

                    <td>
                      {ticket.category
                        ?.name ??
                        "Sin categoría"}
                    </td>

                    <td>
                      {ticket.user
                        ?.name ??
                        "No disponible"}
                    </td>

                    <td>
                      {ticket
                        .assignedToUser
                        ?.name ??
                        "Sin asignar"}
                    </td>

                    <td>
                      {new Date(
                        ticket.createdAt
                      ).toLocaleString()}
                    </td>

                    <td>
                      <Link
                        to={
                          `/tickets/${ticket.id}`
                        }
                      >
                        Ver detalle
                      </Link>
                    </td>

                  </tr>
                )
              )}
            </tbody>
          </table>

        </div>
      )}

      {/* =========================
          PAGINACIÓN
          ========================= */}

      <div className="tickets-pagination">

        <button
          type="button"
          onClick={() =>
            setPage(
              (current) =>
                current - 1
            )
          }
          disabled={page === 1}
        >
          Anterior
        </button>

        <span>
          Página {page} de{" "}
          {totalPages}
        </span>

        <button
          type="button"
          onClick={() =>
            setPage(
              (current) =>
                current + 1
            )
          }
          disabled={
            page >= totalPages
          }
        >
          Siguiente
        </button>

      </div>

    </div>
  );
}

export default TicketsPage;