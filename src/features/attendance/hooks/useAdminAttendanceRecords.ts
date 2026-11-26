import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../../lib/api";
import type {
  ApiResponse,
  AttendanceRecordsData,
} from "../types/attendance.types";

interface UseAdminAttendanceRecordsOptions {
  date: string;
  status: string;
  search: string;
  page: number;
}

export function useAdminAttendanceRecords({
  date,
  status,
  search,
  page,
}: UseAdminAttendanceRecordsOptions) {
  return useQuery({
    queryKey: ["admin-attendance", date, status, search, page],
    queryFn: async () => {
      const response = await adminApi.get<ApiResponse<AttendanceRecordsData>>(
        "/attendance/records",
        {
          params: {
            date,
            ...(status && { status }),
            ...(search.trim() && { search: search.trim() }),
            page,
            limit: 20,
          },
        },
      );

      return response.data.data;
    },
  });
}
