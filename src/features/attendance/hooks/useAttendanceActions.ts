import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeApi } from "../../../lib/api";
import type { AttendanceActionInput } from "../types/attendance.types";
import { getErrorDetails } from "../utils/attendance-errors";

interface UseAttendanceActionsOptions {
  onCheckInSuccess?: () => void;
  onCheckOutSuccess?: () => void;
  onError: (message: string) => void;
  onCheckInReasonRequired: () => void;
  onCheckOutNoteRequired: () => void;
}

export function useAttendanceActions({
  onCheckInSuccess,
  onCheckOutSuccess,
  onError,
  onCheckInReasonRequired,
  onCheckOutNoteRequired,
}: UseAttendanceActionsOptions) {
  const queryClient = useQueryClient();

  const checkInMutation = useMutation({
    mutationFn: async (input: AttendanceActionInput) => {
      const response = await employeeApi.post(
        "/employee/attendance/check-in",
        input,
      );

      return response.data;
    },
    onSuccess: async () => {
      onError("");
      onCheckInSuccess?.();

      await queryClient.invalidateQueries({
        queryKey: ["employee-today-attendance"],
      });
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: unknown;
        };
      };

      console.error("Check-in API error:", {
        status: axiosError.response?.status,
        response: axiosError.response?.data,
        error,
      });

      const details = getErrorDetails(error);

      if (details.code === "LATE_REASON_REQUIRED") {
        onCheckInReasonRequired();
        onError("Please provide a reason for your late check-in.");
        return;
      }

      onError(details.message);
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async (input: AttendanceActionInput) => {
      const response = await employeeApi.post(
        "/employee/attendance/check-out",
        input,
      );

      return response.data;
    },
    onSuccess: async () => {
      onError("");
      onCheckOutSuccess?.();

      await queryClient.invalidateQueries({
        queryKey: ["employee-today-attendance"],
      });
    },
    onError: (error: unknown) => {
      const details = getErrorDetails(error);

      if (details.code === "CHECKOUT_NOTE_REQUIRED") {
        onCheckOutNoteRequired();
        onError("Please provide a note for your late checkout.");
        return;
      }

      onError(details.message);
    },
  });

  return {
    checkInMutation,
    checkOutMutation,
    isSubmitting: checkInMutation.isPending || checkOutMutation.isPending,
  };
}
