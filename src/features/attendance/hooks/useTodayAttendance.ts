import { useQuery } from "@tanstack/react-query";

import { employeeApi } from "../../../lib/api";
import type {
  ApiResponse,
  TodayAttendanceResponse,
} from "../types/attendance.types";

export function useTodayAttendance() {
  return useQuery({
    queryKey: ["employee-today-attendance"],
    queryFn: async () => {
      const response = await employeeApi.get<
        ApiResponse<TodayAttendanceResponse>
      >("/employee/attendance/today");

      return response.data.data;
    },
  });
}
