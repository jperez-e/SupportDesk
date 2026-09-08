import {
  useEffect,
  useState,
} from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

import {
  getDashboardSummary,
} from "../services/dashboardService";

import type {
  DashboardSummary,
} from "../types/dashboard";

import StatCard from "../components/StatCard";

function DashboardPage() {
  const [dashboard, setDashboard] =
    useState<DashboardSummary | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const result =
          await getDashboardSummary();

        setDashboard(result);
      } catch (error) {
        console.error(
          "Error al cargar dashboard:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Ocurrió un error al cargar el dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />

        <p>
          Cargando información...
        </p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>

            <p>
              Resumen general de SupportDesk
            </p>
          </div>
        </div>

        <p className="error-message">
          {errorMessage}
        </p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="dashboard-empty">
        No hay información disponible.
      </div>
    );
  }

  const priorityData = [
    {
      name: "Baja",
      tickets:
        dashboard.lowPriorityTickets,
    },
    {
      name: "Media",
      tickets:
        dashboard.mediumPriorityTickets,
    },
    {
      name: "Alta",
      tickets:
        dashboard.highPriorityTickets,
    },
    {
      name: "Crítica",
      tickets:
        dashboard.criticalPriorityTickets,
    },
  ];

  const activityData =
    dashboard.ticketsByDay.map(
      (day) => ({
        ...day,

        displayDate:
          new Date(
            day.date
          ).toLocaleDateString(
            "es-DO",
            {
              day: "2-digit",
              month: "short",
            }
          ),
      })
    );

  return (
    <div className="dashboard-page">

      {/* ========================================
          ENCABEZADO
          ======================================== */}

      <div className="dashboard-header">

        <div>
          <h1>
            Dashboard
          </h1>

          <p>
            Resumen general de la operación
            de soporte.
          </p>
        </div>

        <div className="dashboard-header-status">
          <span />

          Sistema operativo
        </div>

      </div>

      {/* ========================================
          KPIs PRINCIPALES
          ======================================== */}

      <section className="dashboard-grid">

        <StatCard
          label="Total de tickets"
          value={dashboard.totalTickets}
        />

        <StatCard
          label="Abiertos"
          value={dashboard.openTickets}
        />

        <StatCard
          label="En progreso"
          value={
            dashboard.inProgressTickets
          }
        />

        <StatCard
          label="Resueltos"
          value={
            dashboard.resolvedTickets
          }
        />

      </section>

      {/* ========================================
          KPIs SECUNDARIOS
          ======================================== */}

      <section className="dashboard-secondary-grid">

        <div className="dashboard-mini-card">

          <span>
            Sin asignar
          </span>

          <strong>
            {dashboard.unassignedTickets}
          </strong>

          <small>
            Tickets pendientes de agente
          </small>

        </div>

        <div className="dashboard-mini-card">

          <span>
            Últimos 7 días
          </span>

          <strong>
            {dashboard.ticketsLast7Days}
          </strong>

          <small>
            Nuevos tickets registrados
          </small>

        </div>

        <div className="dashboard-mini-card">

          <span>
            Tiempo de resolución
          </span>

          <strong>
            {dashboard.averageResolutionHours
              .toFixed(1)}
            <small> h</small>
          </strong>

          <small>
            Promedio general
          </small>

        </div>

        <div className="dashboard-mini-card">

          <span>
            Cerrados
          </span>

          <strong>
            {dashboard.closedTickets}
          </strong>

          <small>
            Tickets finalizados
          </small>

        </div>

      </section>

      {/* ========================================
          ACTIVIDAD + PRIORIDAD
          ======================================== */}

      <div className="dashboard-main-grid">

        <section className="dashboard-section">

          <div className="dashboard-section-heading">

            <div>
              <h2>
                Actividad reciente
              </h2>

              <p>
                Tickets creados por día
              </p>
            </div>

          </div>

          {activityData.length === 0 ? (
            <div className="dashboard-empty-state">
              No hay actividad reciente.
            </div>
          ) : (
            <div className="dashboard-chart">

              <ResponsiveContainer
                width="100%"
                height={300}
              >
                <LineChart
                  data={activityData}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="displayDate"
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="ticketCount"
                    name="Tickets"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                    }}
                  />

                </LineChart>
              </ResponsiveContainer>

            </div>
          )}

        </section>

        <section className="dashboard-section">

          <div className="dashboard-section-heading">

            <div>
              <h2>
                Por prioridad
              </h2>

              <p>
                Distribución actual
              </p>
            </div>

          </div>

          <div className="dashboard-priority-list">

            <div className="dashboard-priority-row">
              <span className="priority-dot priority-low" />

              <span>
                Baja
              </span>

              <strong>
                {dashboard.lowPriorityTickets}
              </strong>
            </div>

            <div className="dashboard-priority-row">
              <span className="priority-dot priority-medium" />

              <span>
                Media
              </span>

              <strong>
                {dashboard.mediumPriorityTickets}
              </strong>
            </div>

            <div className="dashboard-priority-row">
              <span className="priority-dot priority-high" />

              <span>
                Alta
              </span>

              <strong>
                {dashboard.highPriorityTickets}
              </strong>
            </div>

            <div className="dashboard-priority-row">
              <span className="priority-dot priority-critical" />

              <span>
                Crítica
              </span>

              <strong>
                {dashboard.criticalPriorityTickets}
              </strong>
            </div>

          </div>

          <div className="dashboard-small-chart">

            <ResponsiveContainer
              width="100%"
              height={170}
            >
              <BarChart
                data={priorityData}
              >
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip />

                <Bar
                  dataKey="tickets"
                  name="Tickets"
                  fill="#2563eb"
                  radius={[5, 5, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>

        </section>

      </div>

      {/* ========================================
          CATEGORÍAS + AGENTES
          ======================================== */}

      <div className="dashboard-two-columns">

        <section className="dashboard-section">

          <div className="dashboard-section-heading">
            <div>
              <h2>
                Tickets por categoría
              </h2>

              <p>
                Distribución de solicitudes
              </p>
            </div>
          </div>

          {dashboard
            .ticketsByCategory
            .length === 0 ? (

            <div className="dashboard-empty-state">
              No hay información disponible.
            </div>

          ) : (

            <div className="dashboard-list">

              {dashboard
                .ticketsByCategory
                .map((category) => (

                  <div
                    key={
                      category.categoryId
                    }
                    className="dashboard-list-item"
                  >
                    <span>
                      {category.categoryName}
                    </span>

                    <strong>
                      {category.ticketCount}
                    </strong>
                  </div>

                ))}

            </div>

          )}

        </section>

        <section className="dashboard-section">

          <div className="dashboard-section-heading">
            <div>
              <h2>
                Tickets por agente
              </h2>

              <p>
                Carga de trabajo actual
              </p>
            </div>
          </div>

          {dashboard
            .ticketsByAgent
            .length === 0 ? (

            <div className="dashboard-empty-state">
              No hay tickets asignados.
            </div>

          ) : (

            <div className="dashboard-list">

              {dashboard
                .ticketsByAgent
                .map((agent) => (

                  <div
                    key={agent.agentId}
                    className="dashboard-list-item"
                  >
                    <span>
                      {agent.agentName}
                    </span>

                    <strong>
                      {agent.ticketCount}
                    </strong>
                  </div>

                ))}

            </div>

          )}

        </section>

      </div>

      {/* ========================================
          RENDIMIENTO
          ======================================== */}

      <section className="dashboard-section">

        <div className="dashboard-section-heading">

          <div>
            <h2>
              Rendimiento de agentes
            </h2>

            <p>
              Resolución y tiempos promedio
            </p>
          </div>

        </div>

        {dashboard
          .agentPerformance
          .length === 0 ? (

          <div className="dashboard-empty-state">
            No hay información de rendimiento.
          </div>

        ) : (

          <div className="dashboard-table-container">

            <table className="dashboard-table">

              <thead>
                <tr>
                  <th>
                    Agente
                  </th>

                  <th>
                    Tickets resueltos
                  </th>

                  <th>
                    Tiempo promedio
                  </th>

                  <th>
                    Rendimiento
                  </th>
                </tr>
              </thead>

              <tbody>

                {dashboard
                  .agentPerformance
                  .map((agent) => (

                    <tr key={agent.agentId}>

                      <td>
                        <strong>
                          {agent.agentName}
                        </strong>
                      </td>

                      <td>
                        {agent.resolvedTickets}
                      </td>

                      <td>
                        {agent
                          .averageResolutionHours
                          .toFixed(1)}{" "}
                        horas
                      </td>

                      <td>
                        <span className="performance-badge">
                          Activo
                        </span>
                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
}

export default DashboardPage;