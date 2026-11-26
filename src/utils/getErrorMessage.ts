import axios from "axios";

interface ApiErrorResponse {
  message?: string;
  error?:
    | string
    | {
        message?: string;
        details?: Array<{
          path?: string;
          message?: string;
        }>;
      };
}

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const response = error.response?.data;
    const apiError = response?.error;

    if (typeof apiError === "string") {
      return apiError;
    }

    if (apiError?.details?.length) {
      return apiError.details
        .map((detail) => detail.message)
        .filter(Boolean)
        .join(" ");
    }

    return apiError?.message || response?.message || error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}
