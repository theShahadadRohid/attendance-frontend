interface AttendanceApiErrorResponse {
  message?: string;
  code?: string;
  error?: {
    message?: string;
    code?: string;
  };
}

interface AttendanceErrorDetails {
  message: string;
  code?: string;
}

export function getErrorDetails(error: unknown): AttendanceErrorDetails {
  const response = (
    error as {
      response?: {
        data?: AttendanceApiErrorResponse;
      };
    }
  )?.response?.data;

  return {
    message:
      response?.message ??
      response?.error?.message ??
      "Something went wrong. Please try again.",
    code: response?.code ?? response?.error?.code,
  };
}
