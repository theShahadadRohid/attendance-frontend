import { useState } from "react";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiRefreshCw,
  FiSearch,
} from "react-icons/fi";

import { getErrorMessage } from "../../utils/getErrorMessage";

import { AttendanceRecordsTable } from "./components/AttendanceRecordsTable";
import { useAdminAttendanceRecords } from "./hooks/useAdminAttendanceRecords";

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

export default function AdminAttendancePage() {
  const [date, setDate] = useState(getTodayDate);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useAdminAttendanceRecords({
      date,
      status,
      search,
      page,
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
    <div className="w-full space-y-7">
      {/* Page header */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#F40026]" />
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Management
            </p>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#030708] sm:text-3xl">
            Attendance
          </h1>

          <p className="mt-1.5 text-sm text-slate-500">
            View and filter employee attendance records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-[#030708] transition hover:border-[#F40026] hover:text-[#F40026] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F40026]/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiRefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </section>

      {/* Filters */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-[#030708]">
            Filter attendance
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Find records using a date, attendance status, or employee details.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Date */}
          <div>
            <label
              htmlFor="attendance-date"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
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
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-[#030708] outline-none transition focus:border-[#F40026] focus:ring-2 focus:ring-[#F40026]/10"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="attendance-status"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Attendance status
            </label>

            <select
              id="attendance-status"
              value={status}
              onChange={(event) => updateStatus(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-[#030708] outline-none transition focus:border-[#F40026] focus:ring-2 focus:ring-[#F40026]/10"
            >
              <option value="">All statuses</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label
              htmlFor="attendance-search"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
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
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-[#030708] outline-none transition placeholder:text-slate-400 focus:border-[#F40026] focus:ring-2 focus:ring-[#F40026]/10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Attendance records */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-base font-bold text-[#030708]">
              Attendance Records
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Employee check-in and check-out activity.
            </p>
          </div>

          <span className="w-fit rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 tabular-nums">
            {pagination?.totalRecords ?? 0} records
          </span>
        </div>

        {isLoading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-sm text-slate-500">
            <FiRefreshCw className="animate-spin text-xl text-[#F40026]" />
            Loading attendance records...
          </div>
        ) : isError ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-[#F40026]">
              <FiClock size={20} />
            </div>

            <p className="mt-4 text-sm font-semibold text-[#030708]">
              Unable to load attendance
            </p>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              {getErrorMessage(
                error,
                "Something went wrong while loading attendance.",
              )}
            </p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 rounded-lg bg-[#F40026] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#D90022] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F40026]/30 focus-visible:ring-offset-2"
            >
              Try again
            </button>
          </div>
        ) : records.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <FiClock size={22} />
            </div>

            <p className="mt-4 text-sm font-semibold text-[#030708]">
              No attendance records found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try changing the date or filters.
            </p>
          </div>
        ) : (
          <AttendanceRecordsTable records={records} />
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs font-medium text-slate-500">
              Showing page{" "}
              <span className="font-semibold text-[#030708]">
                {pagination.page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#030708]">
                {pagination.totalPages}
              </span>
              <span className="mx-1.5 text-slate-300">·</span>
              {pagination.totalRecords} total records
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((current) => current - 1)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-[#030708] transition hover:border-[#F40026] hover:text-[#F40026] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F40026]/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiChevronLeft size={15} />
                Previous
              </button>

              <button
                type="button"
                disabled={page >= pagination.totalPages || isFetching}
                onClick={() => setPage((current) => current + 1)}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-[#030708] transition hover:border-[#F40026] hover:text-[#F40026] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F40026]/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <FiChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
