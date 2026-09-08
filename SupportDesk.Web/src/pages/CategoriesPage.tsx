import {
  useEffect,
  useState,
} from "react";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";

import {
  useToast,
} from "../contexts/ToastContext";

import {
  useConfirm,
} from "../contexts/ConfirmContext";

import type {
  Category,
} from "../types/category";

function CategoriesPage() {
  const { showToast } =
    useToast();

  const { confirm } =
    useConfirm();

  const [
    categories,
    setCategories,
  ] = useState<Category[]>([]);

  const [
    name,
    setName,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    editingCategoryId,
    setEditingCategoryId,
  ] = useState<number | null>(null);

  const [
    deletingCategoryId,
    setDeletingCategoryId,
  ] = useState<number | null>(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

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
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  // ========================================
  // LIMPIAR FORMULARIO
  // ========================================

  const resetForm = () => {
    setName("");
    setDescription("");
    setEditingCategoryId(null);
  };

  // ========================================
  // CREAR O EDITAR
  // ========================================

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setErrorMessage("");

    if (name.trim().length < 2) {
      setErrorMessage(
        "El nombre debe tener al menos 2 caracteres."
      );

      return;
    }

    if (description.length > 300) {
      setErrorMessage(
        "La descripción no puede superar los 300 caracteres."
      );

      return;
    }

    try {
      setIsSubmitting(true);

      if (editingCategoryId === null) {
        const createdCategory =
          await createCategory({
            name: name.trim(),
            description:
              description.trim(),
          });

        setCategories(
          (currentCategories) => [
            ...currentCategories,
            createdCategory,
          ]
        );

        showToast(
          "Categoría creada correctamente.",
          "success"
        );
      } else {
        const updatedCategory =
          await updateCategory(
            editingCategoryId,
            {
              name: name.trim(),
              description:
                description.trim(),
            }
          );

        setCategories(
          (currentCategories) =>
            currentCategories.map(
              (category) =>
                category.id ===
                editingCategoryId
                  ? updatedCategory
                  : category
            )
        );

        showToast(
          "Categoría actualizada correctamente.",
          "success"
        );
      }

      resetForm();
    } catch (error) {
      console.error(
        "Error al guardar categoría:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "No se pudo guardar la categoría.";

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
  // EDITAR
  // ========================================

  const handleEdit = (
    category: Category
  ) => {
    setEditingCategoryId(
      category.id
    );

    setName(
      category.name
    );

    setDescription(
      category.description
    );

    setErrorMessage("");
  };

  // ========================================
  // ELIMINAR
  // ========================================

  const handleDelete = async (
    category: Category
  ) => {
    const confirmed =
      await confirm({
        title:
          "Eliminar categoría",
        message:
          `¿Deseas eliminar la categoría "${category.name}"? Esta acción solo será posible si no tiene tickets asociados.`,
        confirmText:
          "Eliminar categoría",
        cancelText:
          "Cancelar",
        variant:
          "danger",
      });

    if (!confirmed) {
      return;
    }

    try {
      setDeletingCategoryId(
        category.id
      );

      setErrorMessage("");
  
      await deleteCategory(
        category.id
      );

      setCategories(
        (currentCategories) =>
          currentCategories.filter(
            (currentCategory) =>
              currentCategory.id !==
              category.id
          )
      );

      if (
        editingCategoryId ===
        category.id
      ) {
        resetForm();
      }

      showToast(
        "Categoría eliminada correctamente.",
        "success"
      );
    } catch (error) {
      console.error(
        "Error al eliminar categoría:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la categoría.";

      setErrorMessage(message);

      showToast(
        message,
        "error"
      );
    } finally {
      setDeletingCategoryId(null);
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
          Cargando categorías...
        </p>
      </div>
    );
  }

  // ========================================
  // JSX
  // ========================================

  return (
    <div className="categories-page">

      <div className="ticket-section-header">
        <h1>
          Gestión de categorías
        </h1>

        <p>
          Crea, edita y elimina
          categorías del sistema.
        </p>
      </div>

      {errorMessage && (
        <p className="error-message">
          {errorMessage}
        </p>
      )}

      <section className="ticket-form-card">

        <div className="ticket-section-header">
          <h2>
            {editingCategoryId === null
              ? "Nueva categoría"
              : "Editar categoría"}
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
        >

          <div className="form-group">
            <label htmlFor="name">
              Nombre
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              disabled={
                isSubmitting
              }
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
              disabled={
                isSubmitting
              }
              rows={4}
            />
          </div>

          <div className="form-actions">

            {editingCategoryId !== null && (
              <button
                type="button"
                onClick={resetForm}
                disabled={
                  isSubmitting
                }
              >
                Cancelar edición
              </button>
            )}

            <button
              type="submit"
              disabled={
                isSubmitting
              }
            >
              {isSubmitting
                ? "Guardando..."
                : editingCategoryId === null
                  ? "Crear categoría"
                  : "Guardar cambios"}
            </button>

          </div>

        </form>

      </section>

      <div className="users-table-container">

        <table className="users-table">

          <thead>
            <tr>
              <th>
                ID
              </th>

              <th>
                Nombre
              </th>

              <th>
                Descripción
              </th>

              <th>
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>

            {categories.map(
              (category) => (
                <tr key={category.id}>

                  <td>
                    {category.id}
                  </td>

                  <td>
                    {category.name}
                  </td>

                  <td>
                    {category.description}
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() =>
                        handleEdit(
                          category
                        )
                      }
                      disabled={
                        deletingCategoryId ===
                        category.id
                      }
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          category
                        )
                      }
                      disabled={
                        deletingCategoryId ===
                        category.id
                      }
                    >
                      {deletingCategoryId ===
                      category.id
                        ? "Eliminando..."
                        : "Eliminar"}
                    </button>
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default CategoriesPage;