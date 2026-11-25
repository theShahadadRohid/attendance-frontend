import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";

import { adminApi } from "../../lib/api";

interface AttendanceEmployee {
  _id: string;
  employeeCode: string;
  fullName: string;
  phoneNumber: string;
  employmentType?: string;
  department?: string;
}

interface AttendanceRecord {
  _id: string;
  employee: AttendanceEmployee | null;
  date: string;
  timeZone: string;
  status: "present" | "late" | "absent";
  checkInAt?: string;
  checkInStatus?: "on_time" | "late_yellow" | "late_red";
  checkInReason?: string;
  checkOutAt?: string;
  checkOutStatus?: "early" | "normal";
  checkOutNote?: string;
  isAutoCheckout: boolean;
  needsReview: boolean;
  reviewReason?: string;
}

interface AttendanceListResponse {
  message: string;
  data: {
    date: string;
    records: AttendanceRecord[];
    pagination: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
    };
  };
}

function getTodayDate(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function formatTime(value?: string, timeZone = "Asia/Dhaka"): string {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-BD", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

function getErrorMessage(error: unknown): string {
  const axiosError = error as {
    response?: {
      data?: {
        message?: string;
        error?: string;
      };
    };
    message?: string;
  };

  return (
    axiosError.response?.data?.message ||
    axiosError.response?.data?.error ||
    axiosError.message ||
    "Something went wrong while loading attendance."
  );
}

function StatusBadge({ status }: { status: AttendanceRecord["status"] }) {
  const styles = {
    present: "bg-green-100 text-green-700",
    late: "bg-amber-100 text-amber-700",
    absent: "bg-red-100 text-red-700",
  };

  const labels = {
    present: "Present",
    late: "Late",
    absent: "Absent",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function CheckInStatus({
  status,
}: {
  status?: AttendanceRecord["checkInStatus"];
}) {
  if (!status) return <span className="text-slate-400">—</span>;

  const labels = {
    on_time: "On time",
    late_yellow: "Late (Yellow)",
    late_red: "Late (Red)",
  };

  const styles = {
    on_time: "text-green-700",
    late_yellow: "text-amber-700",
    late_red: "text-red-700",
  };

  return (
    <span className={`text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export default function AdminAttendancePage() {
  const [date, setDate] = useState(getTodayDate);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["admin-attendance", date, status, search, page],
    queryFn: async () => {
      const response = await adminApi.get<AttendanceListResponse>(
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

  const records = data?.records ?? [];
  const pagination = data?.pagination;

  function updateDate(value: string) {
    setDate(value);
    setPage(1);
  }

  function updateStatus(value: string) {
    setStatus(value);
    setPage(1);
  }

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
          <p className="mt-1 text-sm text-slate-500">
            View and filter employee attendance records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiRefreshCw className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-3">
        <div>
          <label
            htmlFor="attendance-date"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Attendance date
          </label>
          <div className="relative">
            <FiCalendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="attendance-date"
              type="date"
              value={date}
              onChange={(event) => updateDate(event.target.value)}
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="attendance-status"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Attendance status
          </label>
          <select
            id="attendance-status"
            value={status}
            onChange={(event) => updateStatus(event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All statuses</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="attendance-search"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Search employee
          </label>
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="attendance-search"
              type="search"
              value={search}
              onChange={(event) => updateSearch(event.target.value)}
              placeholder="Name, employee ID or phone"
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-1 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-slate-900">Attendance records</h2>
          <p className="text-sm text-slate-500">
            {pagination?.totalRecords ?? 0} records found
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
            <FiRefreshCw className="animate-spin" />
            Loading attendance...
          </div>
        ) : isError ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-red-600">{getErrorMessage(error)}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Try again
            </button>
          </div>
        ) : records.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <FiClock className="mx-auto mb-3 text-3xl text-slate-300" />
            <p className="font-medium text-slate-700">
              No attendance records found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try changing the date or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Employee</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Check-in</th>
                  <th className="px-4 py-3 font-semibold">Check-in type</th>
                  <th className="px-4 py-3 font-semibold">Check-out</th>
                  <th className="px-4 py-3 font-semibold">Review</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {records.map((record) => {
                  const employee = record.employee;

                  return (
                    <tr key={record._id} className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        {employee ? (
                          <>
                            <p className="font-medium text-slate-900">
                              {employee.fullName}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {employee.employeeCode} · {employee.phoneNumber}
                            </p>
                          </>
                        ) : (
                          <span className="text-slate-400">
                            Employee unavailable
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={record.status} />
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-700">
                          {formatTime(record.checkInAt, record.timeZone)}
                        </p>
                        {record.checkInReason && (
                          <p
                            className="mt-1 max-w-48 truncate text-xs text-slate-500"
                            title={record.checkInReason}
                          >
                            Reason: {record.checkInReason}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <CheckInStatus status={record.checkInStatus} />
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-700">
                          {formatTime(record.checkOutAt, record.timeZone)}
                        </p>
                        {record.isAutoCheckout && (
                          <p className="mt-1 text-xs text-amber-600">
                            Automatic checkout
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {record.needsReview ? (
                          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            Needs review
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
              {" · "}
              {pagination.totalRecords} total records
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((current) => current - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiChevronLeft />
                Previous
              </button>

              <button
                type="button"
                disabled={page >= pagination.totalPages || isFetching}
                onClick={() => setPage((current) => current + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
