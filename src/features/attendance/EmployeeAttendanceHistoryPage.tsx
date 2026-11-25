import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FiCalendar,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiEdit2,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";

import { adminApi } from "../../lib/api";

interface Employee {
  _id: string;
  employeeCode: string;
  fullName: string;
  designation?: string;
  phoneNumber: string;
  employmentType: string;
  department?: string;
  isActive: boolean;
}

interface AttendanceRecord {
  _id: string;
  employee: string;
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
  correctionReason?: string;
  correctedAt?: string;
}

interface HistoryResponse {
  message: string;
  data: {
    employee: Employee;
    filters: {
      from: string | null;
      to: string | null;
    };
    records: AttendanceRecord[];
    pagination: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
    };
  };
}

interface CorrectionInput {
  checkInAt?: string;
  checkOutAt?: string;
  reason: string;
}

function formatTime(value?: string, timeZone = "Asia/Dhaka") {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-BD", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function toDateTimeLocal(value?: string, timeZone = "Asia/Dhaka") {
  if (!value) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

function toDhakaISO(value: string) {
  if (!value) return undefined;

  // datetime-local input has no timezone. Attendance uses Asia/Dhaka.
  return `${value}:00+06:00`;
}

function getErrorMessage(error: unknown) {
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
    "Something went wrong."
  );
}

function StatusBadge({ status }: { status: AttendanceRecord["status"] }) {
  const styles = {
    present: "bg-slate-100 text-slate-700",
    late: "bg-red-50 text-[#F40026]",
    absent: "bg-[#030708] text-white",
  };

  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${styles[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function CorrectionForm({
  record,
  onClose,
  onSubmit,
  isPending,
  error,
}: {
  record: AttendanceRecord;
  onClose: () => void;
  onSubmit: (input: CorrectionInput) => void;
  isPending: boolean;
  error: string | null;
}) {
  const [checkInAt, setCheckInAt] = useState(
    toDateTimeLocal(record.checkInAt, record.timeZone),
  );

  const [checkOutAt, setCheckOutAt] = useState(
    toDateTimeLocal(record.checkOutAt, record.timeZone),
  );

  const [reason, setReason] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      ...(checkInAt && { checkInAt: toDhakaISO(checkInAt) }),
      ...(checkOutAt && { checkOutAt: toDhakaISO(checkOutAt) }),
      reason: reason.trim(),
    });
  }

  const inputClassName =
    "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#F40026] focus:ring-2 focus:ring-[#F40026]/10";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 border-t border-slate-200 bg-slate-50 p-3 sm:p-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#030708]">
            Correct attendance
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Times are interpreted as Bangladesh local time (Asia/Dhaka).
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-[#030708]"
          aria-label="Close correction form"
        >
          <FiX size={17} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Check-in time
          </label>

          <input
            type="datetime-local"
            value={checkInAt}
            onChange={(event) => setCheckInAt(event.target.value)}
            className={inputClassName}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Check-out time
          </label>

          <input
            type="datetime-local"
            value={checkOutAt}
            onChange={(event) => setCheckOutAt(event.target.value)}
            className={inputClassName}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">
          Correction reason *
        </label>

        <textarea
          required
          minLength={1}
          maxLength={500}
          rows={2}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Explain why this attendance record needs correction..."
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#F40026] focus:ring-2 focus:ring-[#F40026]/10"
        />

        <p className="mt-0.5 text-right text-xs text-slate-400">
          {reason.length}/500
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isPending || !reason.trim() || (!checkInAt && !checkOutAt)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F40026] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <FiRefreshCw className="animate-spin" size={15} />
          ) : (
            <FiCheck size={15} />
          )}
          {isPending ? "Saving..." : "Save correction"}
        </button>
      </div>
    </form>
  );
}

export default function EmployeeAttendanceHistoryPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const queryClient = useQueryClient();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [editingRecord, setEditingRecord] = useState<string | null>(null);

  const historyQuery = useQuery({
    queryKey: ["admin-employee-attendance", employeeId, from, to, page],
    enabled: Boolean(employeeId),
    queryFn: async () => {
      const response = await adminApi.get<HistoryResponse>(
        `/attendance/employees/${employeeId}/history`,
        {
          params: {
            ...(from && { from }),
            ...(to && { to }),
            page,
            limit: 20,
          },
        },
      );

      return response.data.data;
    },
  });

  const correctionMutation = useMutation({
    mutationFn: async ({
      attendanceId,
      input,
    }: {
      attendanceId: string;
      input: CorrectionInput;
    }) => {
      await adminApi.patch(`/attendance/${attendanceId}/correct`, input);
    },
    onSuccess: () => {
      setEditingRecord(null);

      void queryClient.invalidateQueries({
        queryKey: ["admin-employee-attendance", employeeId],
      });

      void queryClient.invalidateQueries({
        queryKey: ["admin-attendance"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["admin-dashboard"],
      });
    },
  });

  const data = historyQuery.data;
  const records = data?.records ?? [];
  const pagination = data?.pagination;

  function handleFromChange(value: string) {
    setFrom(value);
    setPage(1);
  }

  function handleToChange(value: string) {
    setTo(value);
    setPage(1);
  }

  if (!employeeId) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Employee ID is missing from the URL.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Page heading */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#030708]">
            Attendance History
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            View and correct employee attendance records.
          </p>
        </div>
      </div>

      {historyQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-12 text-sm text-slate-500">
          <FiRefreshCw className="animate-spin text-[#F40026]" />
          Loading employee attendance...
        </div>
      ) : historyQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            {getErrorMessage(historyQuery.error)}
          </p>

          <button
            type="button"
            onClick={() => void historyQuery.refetch()}
            className="mt-2 text-sm font-semibold text-[#F40026] hover:underline"
          >
            Try again
          </button>
        </div>
      ) : data ? (
        <>
          {/* Compact employee overview */}
          <section className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#030708] text-sm font-bold text-white">
                  {data.employee.fullName
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part.charAt(0).toUpperCase())
                    .join("")}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-bold text-[#030708]">
                      {data.employee.fullName}
                    </h2>

                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        data.employee.isActive
                          ? "bg-slate-100 text-slate-700"
                          : "bg-red-50 text-[#F40026]"
                      }`}
                    >
                      {data.employee.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {data.employee.employeeCode}
                    {" · "}
                    {data.employee.designation || data.employee.employmentType}
                    {data.employee.department &&
                      ` · ${data.employee.department}`}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {data.employee.phoneNumber}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 px-3 py-2">
                <p className="text-xs text-slate-500">Total records</p>
                <p className="text-xl font-bold tabular-nums text-[#030708]">
                  {pagination?.totalRecords ?? 0}
                </p>
              </div>
            </div>
          </section>

          {/* Compact date filters */}
          <section className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-[#030708]">
                Filter attendance
              </h2>

              {(from || to) && (
                <button
                  type="button"
                  onClick={() => {
                    setFrom("");
                    setTo("");
                    setPage(1);
                  }}
                  className="text-xs font-semibold text-[#F40026] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  From date
                </label>

                <div className="relative">
                  <FiCalendar
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="date"
                    value={from}
                    max={to || undefined}
                    onChange={(event) => handleFromChange(event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-[#F40026] focus:ring-2 focus:ring-[#F40026]/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  To date
                </label>

                <div className="relative">
                  <FiCalendar
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="date"
                    value={to}
                    min={from || undefined}
                    onChange={(event) => handleToChange(event.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-[#F40026] focus:ring-2 focus:ring-[#F40026]/10"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Attendance records */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-3.5 py-3 sm:px-4">
              <div>
                <h2 className="text-sm font-semibold text-[#030708]">
                  Attendance records
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {pagination?.totalRecords ?? 0} matching records
                </p>
              </div>

              <button
                type="button"
                onClick={() => void historyQuery.refetch()}
                disabled={historyQuery.isFetching}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#F40026] disabled:opacity-50"
                title="Refresh"
              >
                <FiRefreshCw
                  size={16}
                  className={historyQuery.isFetching ? "animate-spin" : ""}
                />
              </button>
            </div>

            {records.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <FiClock className="mx-auto mb-2 text-2xl text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">
                  No attendance records found
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Try a different date range.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {records.map((record) => (
                  <div key={record._id}>
                    <div className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-start sm:justify-between sm:px-4">
                      <div className="min-w-0 flex-1">
                        {/* Date and status */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="mr-1 text-sm font-semibold text-[#030708]">
                            {formatDate(record.date)}
                          </p>

                          <StatusBadge status={record.status} />

                          {record.needsReview && (
                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-[#F40026]">
                              Needs review
                            </span>
                          )}

                          {record.isAutoCheckout && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                              Auto checkout
                            </span>
                          )}
                        </div>

                        {/* Check-in and check-out */}
                        <div className="mt-3 grid grid-cols-2 gap-4 sm:max-w-sm">
                          <div>
                            <p className="text-xs text-slate-500">Check-in</p>
                            <p className="mt-0.5 text-sm font-semibold text-[#030708]">
                              {formatTime(record.checkInAt, record.timeZone)}
                            </p>
                            {record.checkInStatus && (
                              <p className="mt-0.5 text-xs capitalize text-slate-500">
                                {record.checkInStatus.replaceAll("_", " ")}
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">Check-out</p>
                            <p className="mt-0.5 text-sm font-semibold text-[#030708]">
                              {formatTime(record.checkOutAt, record.timeZone)}
                            </p>
                            {record.checkOutStatus && (
                              <p className="mt-0.5 text-xs capitalize text-slate-500">
                                {record.checkOutStatus}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Additional attendance information */}
                        {(record.checkInReason ||
                          record.checkOutNote ||
                          record.correctionReason ||
                          record.reviewReason) && (
                          <div className="mt-3 space-y-1 border-t border-slate-100 pt-2.5">
                            {record.checkInReason && (
                              <p className="break-words text-xs text-slate-600">
                                <span className="font-semibold text-slate-700">
                                  Check-in reason:
                                </span>{" "}
                                {record.checkInReason}
                              </p>
                            )}

                            {record.checkOutNote && (
                              <p className="break-words text-xs text-slate-600">
                                <span className="font-semibold text-slate-700">
                                  Checkout note:
                                </span>{" "}
                                {record.checkOutNote}
                              </p>
                            )}

                            {record.correctionReason && (
                              <p className="break-words text-xs text-slate-600">
                                <span className="font-semibold text-slate-700">
                                  Correction reason:
                                </span>{" "}
                                {record.correctionReason}
                              </p>
                            )}

                            {record.reviewReason && (
                              <p className="break-words text-xs text-[#F40026]">
                                <span className="font-semibold">
                                  Review reason:
                                </span>{" "}
                                {record.reviewReason}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingRecord(
                            editingRecord === record._id ? null : record._id,
                          );
                          correctionMutation.reset();
                        }}
                        className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                          editingRecord === record._id
                            ? "border-red-200 bg-red-50 text-[#F40026]"
                            : "border-slate-200 bg-white text-slate-700 hover:border-[#F40026] hover:text-[#F40026]"
                        }`}
                      >
                        {editingRecord === record._id ? (
                          <FiX size={14} />
                        ) : (
                          <FiEdit2 size={14} />
                        )}
                        {editingRecord === record._id ? "Close" : "Correct"}
                      </button>
                    </div>

                    {editingRecord === record._id && (
                      <CorrectionForm
                        record={record}
                        isPending={correctionMutation.isPending}
                        error={
                          correctionMutation.isError
                            ? getErrorMessage(correctionMutation.error)
                            : null
                        }
                        onClose={() => {
                          setEditingRecord(null);
                          correctionMutation.reset();
                        }}
                        onSubmit={(input) => {
                          correctionMutation.mutate({
                            attendanceId: record._id,
                            input,
                          });
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 0 && (
              <div className="flex flex-col gap-2 border-t border-slate-200 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                <p className="text-xs text-slate-500">
                  Page {pagination.page} of {pagination.totalPages}
                  {" · "}
                  {pagination.totalRecords} records
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1 || historyQuery.isFetching}
                    onClick={() => setPage((current) => current - 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FiChevronLeft size={14} />
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={
                      page >= pagination.totalPages || historyQuery.isFetching
                    }
                    onClick={() => setPage((current) => current + 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <FiChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
