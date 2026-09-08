import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getTicketById,
  updateTicket,
} from "../services/ticketService";

import {
  getCategories,
} from "../services/categoryService";

import {
  useToast,
} from "../contexts/ToastContext";

import type {
  TicketPriority,
} from "../types/ticket";

import type {
  Category,
} from "../types/category";

function EditTicketPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { showToast } = useToast();

  // ========================================
  // ESTADOS DEL FORMULARIO
  // ========================================

  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    priority,
    setPriority,
  ] = useState<TicketPriority>(
    "Medium"
  );

  const [
    categoryId,
    setCategoryId,
  ] = useState<number>(0);

  const [
    categories,
    setCategories,
  ] = useState<Category[]>([]);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  // ========================================
  // CARGAR TICKET Y CATEGORÍAS
  // ========================================

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setErrorMessage(
          "No se proporcionó un ID de ticket."
        );

        setIsLoading(false);

        return;
      }

      const ticketId =
        Number(id);

      if (
        Number.isNaN(ticketId)
      ) {
        setErrorMessage(
          "El ID del ticket no es válido."
        );

        setIsLoading(false);

        return;
      }

      try {
        setErrorMessage("");

        const [
          ticket,
          categoryList,
        ] = await Promise.all([
          getTicketById(ticketId),
          getCategories(),
        ]);

        setTitle(
          ticket.title
        );

        setDescription(
          ticket.description
        );

        setPriority(
          ticket.priority
        );

        setCategoryId(
          ticket.category?.id ?? 0
        );

        setCategories(
          categoryList
        );

      } catch (error) {
        console.error(
          "Error al cargar datos:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los datos del ticket."
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  // ========================================
  // ENVIAR FORMULARIO
  // ========================================

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!id) {
      return;
    }

    const ticketId =
      Number(id);

    if (
      Number.isNaN(ticketId)
    ) {
      setErrorMessage(
        "El ID del ticket no es válido."
      );

      return;
    }

    setErrorMessage("");

    // ========================================
    // VALIDACIONES
    // ========================================

    if (
      title.trim().length < 5
    ) {
      setErrorMessage(
        "El título debe tener al menos 5 caracteres."
      );

      return;
    }

    if (
      description.trim().length < 10
    ) {
      setErrorMessage(
        "La descripción debe tener al menos 10 caracteres."
      );

      return;
    }

    if (
      categoryId <= 0
    ) {
      setErrorMessage(
        "Debe seleccionar una categoría válida."
      );

      return;
    }

    // ========================================
    // ACTUALIZAR TICKET
    // ========================================

    try {
      setIsSubmitting(true);

      const updatedTicket =
        await updateTicket(
          ticketId,
          {
            title:
              title.trim(),

            description:
              description.trim(),

            priority,

            categoryId,
          }
        );

      showToast(
        "Ticket actualizado correctamente.",
        "success"
      );

      navigate(
        `/tickets/${updatedTicket.id}`
      );

    } catch (error) {
      console.error(
        "Error al actualizar ticket:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el ticket.";

      setErrorMessage(message);

      showToast(
        message,
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================
  // CARGANDO
  // ========================================

  if (isLoading) {
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
  // ERROR DE CARGA
  // ========================================

  if (
    errorMessage &&
    !title
  ) {
    return (
      <div className="edit-ticket-page">

        <div className="ticket-section-header">
          <h1>
            Editar ticket
          </h1>
        </div>

        <p className="error-message">
          {errorMessage}
        </p>

      </div>
    );
  }

  // ========================================
  // JSX
  // ========================================

  return (
    <div className="edit-ticket-page">

      <section className="ticket-form-card">

        <div className="ticket-section-header">

          <h1>
            Editar ticket
          </h1>

          <p>
            Modifica la información
            principal del ticket.
          </p>

        </div>

        <form
          onSubmit={
            handleSubmit
          }
        >

          <div className="form-group">

            <label
              htmlFor="title"
            >
              Título
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(
                event
              ) =>
                setTitle(
                  event.target.value
                )
              }
              disabled={
                isSubmitting
              }
            />

          </div>

          <div className="form-group">

            <label
              htmlFor="description"
            >
              Descripción
            </label>

            <textarea
              id="description"
              value={
                description
              }
              onChange={(
                event
              ) =>
                setDescription(
                  event.target.value
                )
              }
              disabled={
                isSubmitting
              }
              rows={6}
            />

          </div>

          <div className="form-group">

            <label
              htmlFor="priority"
            >
              Prioridad
            </label>

            <select
              id="priority"
              value={
                priority
              }
              onChange={(
                event
              ) =>
                setPriority(
                  event.target
                    .value as TicketPriority
                )
              }
              disabled={
                isSubmitting
              }
            >

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

          <div className="form-group">

            <label
              htmlFor="category"
            >
              Categoría
            </label>

            <select
              id="category"
              value={categoryId}
              onChange={(
                event
              ) =>
                setCategoryId(
                  Number(
                    event.target.value
                  )
                )
              }
              disabled={
                isSubmitting
              }
            >

              <option value={0}>
                Seleccione una categoría
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

          {errorMessage && (
            <p className="error-message">
              {errorMessage}
            </p>
          )}

          <div className="form-actions">

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/tickets/${id}`
                )
              }
              disabled={
                isSubmitting
              }
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting
              }
            >
              {isSubmitting
                ? "Guardando..."
                : "Guardar cambios"}
            </button>

          </div>

        </form>

      </section>

    </div>
  );
}

export default EditTicketPage;
