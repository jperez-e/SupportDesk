import { useEffect, useState } from "react";

import {
  createTicket,
} from "../services/ticketService";

import {
  getCategories,
} from "../services/categoryService";

import {
  useToast,
} from "../contexts/ToastContext";

import type {
  Category,
} from "../types/category";

import type {
  TicketPriority,
} from "../types/ticket";

function CreateTicketPage() {
  const { showToast } = useToast();

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [priority, setPriority] =
    useState<TicketPriority>("Medium");

  const [categoryId, setCategoryId] =
    useState(0);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // ========================================
  // CARGAR CATEGORÍAS
  // ========================================

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setErrorMessage("");

        const result =
          await getCategories();

        setCategories(result);
      } catch (error) {
        console.error(
          "Error al cargar categorías:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las categorías."
        );
      }
    };

    loadCategories();
  }, []);

  // ========================================
  // CREAR TICKET
  // ========================================

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setErrorMessage("");

    // ========================================
    // VALIDACIONES DEL FRONTEND
    // ========================================

    if (title.trim().length < 5) {
      setErrorMessage(
        "El título debe tener al menos 5 caracteres."
      );

      return;
    }

    if (description.trim().length < 10) {
      setErrorMessage(
        "La descripción debe tener al menos 10 caracteres."
      );

      return;
    }

    if (categoryId === 0) {
      setErrorMessage(
        "Debe seleccionar una categoría."
      );

      return;
    }

    const data = {
      title: title.trim(),
      description: description.trim(),
      priority,
      categoryId,
    };

    try {
      setIsSubmitting(true);

      await createTicket(data);

      showToast(
        "Ticket creado correctamente.",
        "success"
      );

      // ========================================
      // LIMPIAR FORMULARIO
      // ========================================

      setTitle("");
      setDescription("");
      setPriority("Medium");
      setCategoryId(0);
    } catch (error) {
      console.error(
        "Error al crear ticket:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Ocurrió un error al crear el ticket.";

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
  // JSX
  // ========================================

  return (
    <div className="create-ticket-page">

      <div className="ticket-section-header">
        <h1>
          Crear ticket
        </h1>

        <p>
          Registra una nueva solicitud
          de soporte.
        </p>
      </div>

      {errorMessage && (
        <p className="error-message">
          {errorMessage}
        </p>
      )}

      <section className="ticket-form-card">

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="title">
              Título
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              disabled={isSubmitting}
              placeholder="Ej. No tengo acceso al sistema"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Descripción
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              disabled={isSubmitting}
              rows={6}
              placeholder="Describe el problema con el mayor detalle posible..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="priority">
              Prioridad
            </label>

            <select
              id="priority"
              value={priority}
              onChange={(event) =>
                setPriority(
                  event.target
                    .value as TicketPriority
                )
              }
              disabled={isSubmitting}
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
            <label htmlFor="categoryId">
              Categoría
            </label>

            <select
              id="categoryId"
              value={categoryId}
              onChange={(event) =>
                setCategoryId(
                  Number(
                    event.target.value
                  )
                )
              }
              disabled={isSubmitting}
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

          <div className="form-actions">
            <button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Creando ticket..."
                : "Crear ticket"}
            </button>
          </div>

        </form>

      </section>

    </div>
  );
}

export default CreateTicketPage;
