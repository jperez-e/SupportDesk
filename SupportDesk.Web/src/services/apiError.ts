export class ApiError extends Error {
  status: number;

  constructor(
    message: string,
    status: number
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
  }
}

interface ApiErrorResponse {
  message?: string;
  title?: string;
  errors?: Record<string, string[]>;
}

export async function throwApiError(
  response: Response,
  defaultMessage: string
): Promise<never> {
  let message = defaultMessage;

  try {
    const data =
      (await response.json()) as ApiErrorResponse;

    // ========================================
    // ERROR PERSONALIZADO DEL BACKEND
    // ========================================

    if (data.message) {
      message = data.message;
    }

    // ========================================
    // ERRORES DE VALIDACIÓN DE ASP.NET CORE
    // ========================================

    else if (data.errors) {
      const validationMessages =
        Object.values(data.errors)
          .flat();

      if (validationMessages.length > 0) {
        message =
          validationMessages.join(" ");
      }
    }

    // ========================================
    // ERROR CON TITLE
    // ========================================

    else if (data.title) {
      message = data.title;
    }
  } catch {
    // Si la respuesta no contiene JSON válido,
    // mantenemos defaultMessage.
  }

  throw new ApiError(
    message,
    response.status
  );
}