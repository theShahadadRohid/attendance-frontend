import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaCalendarDays } from "react-icons/fa6";
import { BiUserX } from "react-icons/bi";
import { FiClock, FiRefreshCw } from "react-icons/fi";

import { adminApi } from "../../lib/api";
import { getErrorMessage } from "../../utils/getErrorMessage";

import type { ApiResponse } from "./types/attendance.types";
import type { DashboardData } from "./types/dashboard.types";

import DashboardSummaryCards from "./components/DashboardSummaryCards";
import NotCheckedInEmployees from "./components/NotCheckedInEmployees";
import { AttendanceRecordsTable } from "./components/AttendanceRecordsTable";

import { useAdminAttendanceRecords } from "./hooks/useAdminAttendanceRecords";

import {
  formatDashboardDate,
  getLocalDateString,
} from "./utils/dashboard-formatters";

export default function AdminDashboardPage() {
  const [date, setDate] = useState(getLocalDateString);

  // Dashboard summary query
  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard", date],
    queryFn: async () => {
      const response = await adminApi.get<ApiResponse<DashboardData>>(
        "/attendance/dashboard",
        { params: { date } },
      );

      return response.data.data;
    },
  });

  // Attendance records query
  const attendanceQuery = useAdminAttendanceRecords({
    date,
    status: "",
    search: "",
    page: 1,
  });

  const dashboard = dashboardQuery.data;
  const attendanceRecords = attendanceQuery.data?.records ?? [];
  const attendancePagination = attendanceQuery.data?.pagination;

  const formattedDate = dashboard ? formatDashboardDate(dashboard.date) : "";

  function handleRefresh() {
    void dashboardQuery.refetch();
    void attendanceQuery.refetch();
  }

  return (
    <div className="w-full space-y-7">
      {/* Page heading and controls */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#F40026]" />
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Overview
            </p>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#030708] sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-1.5 text-sm text-slate-500">
            Overview of employee attendance and daily activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-[#F40026] focus-within:ring-2 focus-within:ring-[#F40026]/10">
            <FaCalendarDays size={15} className="shrink-0 text-slate-500" />

            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              aria-label="Filter attendance by date"
              className="min-w-0 bg-transparent text-sm font-medium text-[#030708] outline-none"
            />
          </label>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={dashboardQuery.isFetching || attendanceQuery.isFetching}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-[#030708] transition hover:border-[#F40026] hover:text-[#F40026] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F40026]/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiRefreshCw
              size={15}
              className={
                dashboardQuery.isFetching || attendanceQuery.isFetching
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>
      </section>

      {/* Dashboard loading state */}
      {dashboardQuery.isLoading && (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8">
          <FiRefreshCw className="animate-spin text-2xl text-[#F40026]" />

          <p className="mt-3 text-sm font-medium text-slate-600">
            Loading dashboard...
          </p>
        </div>
      )}

      {/* Dashboard error state */}
      {dashboardQuery.isError && (
        <div className="rounded-xl border border-red-200 bg-white p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#F40026]">
              <BiUserX size={21} />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[#030708]">
                Unable to load dashboard
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {getErrorMessage(
                  dashboardQuery.error,
                  "Check your connection and Admin session, then try again.",
                )}
              </p>

              <button
                type="button"
                onClick={() => void dashboardQuery.refetch()}
                className="mt-3 text-sm font-semibold text-[#F40026] transition hover:text-[#C90020] focus-visible:outline-none focus-visible:underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard content */}
      {dashboard && (
        <>
          {/* Attendance summary */}
          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-[#030708]">
                  Attendance Summary
                </h2>

                <p className="mt-1 text-sm text-slate-500">{formattedDate}</p>
              </div>

              <p className="text-xs font-medium text-slate-400">
                Daily overview
              </p>
            </div>

            <DashboardSummaryCards summary={dashboard.summary} />
          </section>

          {/* Daily attendance and employees not checked in */}
          <section className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
            {/* Today's attendance */}
            <div className="min-w-0 lg:col-span-8">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-[#030708]">
                    Today's Attendance
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Employee check-in and check-out activity.
                  </p>
                </div>

                {attendancePagination && (
                  <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 tabular-nums">
                    {attendancePagination.totalRecords} records
                  </span>
                )}
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {attendanceQuery.isLoading ? (
                  <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-sm text-slate-500">
                    <FiRefreshCw className="animate-spin text-xl text-[#F40026]" />
                    Loading attendance records...
                  </div>
                ) : attendanceQuery.isError ? (
                  <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-[#F40026]">
                      <FiClock size={20} />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-[#030708]">
                      Unable to load attendance
                    </p>

                    <p className="mt-1 max-w-md text-sm text-slate-500">
                      {getErrorMessage(
                        attendanceQuery.error,
                        "Something went wrong while loading attendance.",
                      )}
                    </p>

                    <button
                      type="button"
                      onClick={() => void attendanceQuery.refetch()}
                      className="mt-4 rounded-lg bg-[#F40026] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#D90022]"
                    >
                      Try again
                    </button>
                  </div>
                ) : attendanceRecords.length === 0 ? (
                  <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <FiClock size={22} />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-[#030708]">
                      No attendance records found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      There are no records for this date.
                    </p>
                  </div>
                ) : (
                  <AttendanceRecordsTable records={attendanceRecords} />
                )}
              </div>
            </div>

            {/* Employees not checked in */}
            <div className="min-w-0 lg:col-span-4">
              <NotCheckedInEmployees
                employees={dashboard.notCheckedInEmployees}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
