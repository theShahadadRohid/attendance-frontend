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
    present: "bg-green-100 text-green-700",
    late: "bg-amber-100 text-amber-700",
    absent: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
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

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 border-t border-slate-200 bg-slate-50 p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Correct attendance</h3>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-200"
        >
          <FiX />
        </button>
      </div>

      <p className="text-xs text-slate-500">
        Times are interpreted as Bangladesh local time (Asia/Dhaka). Leave an
        unchanged time as it is.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Check-in time
          </label>

          <input
            type="datetime-local"
            value={checkInAt}
            onChange={(event) => setCheckInAt(event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Check-out time
          </label>

          <input
            type="datetime-local"
            value={checkOutAt}
            onChange={(event) => setCheckOutAt(event.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Correction reason *
        </label>

        <textarea
          required
          minLength={1}
          maxLength={500}
          rows={3}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Explain why this attendance record needs correction..."
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        />
        <p className="mt-1 text-right text-xs text-slate-400">
          {reason.length}/500
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isPending || !reason.trim() || (!checkInAt && !checkOutAt)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiCheck />
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
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        Employee ID is missing from the URL.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Attendance History
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View and correct an employee's attendance records.
        </p>
      </div>

      {historyQuery.isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-16 text-sm text-slate-500">
          <FiRefreshCw className="animate-spin" />
          Loading employee attendance...
        </div>
      ) : historyQuery.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-700">
            {getErrorMessage(historyQuery.error)}
          </p>

          <button
            type="button"
            onClick={() => void historyQuery.refetch()}
            className="mt-3 text-sm font-semibold text-red-700"
          >
            Try again
          </button>
        </div>
      ) : data ? (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {data.employee.fullName}
                  </h2>

                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      data.employee.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {data.employee.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {data.employee.employeeCode}
                  {" · "}
                  {data.employee.designation || data.employee.employmentType}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {data.employee.phoneNumber}
                  {data.employee.department && ` · ${data.employee.department}`}
                </p>
              </div>

              <div className="text-sm text-slate-500">
                <p>Total matching records</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {pagination?.totalRecords ?? 0}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">
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
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Clear filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  From date
                </label>

                <div className="relative">
                  <FiCalendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={from}
                    max={to || undefined}
                    onChange={(event) => handleFromChange(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  To date
                </label>

                <div className="relative">
                  <FiCalendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={to}
                    min={from || undefined}
                    onChange={(event) => handleToChange(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <h2 className="font-semibold text-slate-900">
                Attendance records
              </h2>

              <button
                type="button"
                onClick={() => void historyQuery.refetch()}
                disabled={historyQuery.isFetching}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                title="Refresh"
              >
                <FiRefreshCw
                  className={historyQuery.isFetching ? "animate-spin" : ""}
                />
              </button>
            </div>

            {records.length === 0 ? (
              <div className="px-4 py-16 text-center">
                <FiClock className="mx-auto mb-3 text-3xl text-slate-300" />
                <p className="font-medium text-slate-700">
                  No attendance records found
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Try a different date range.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {records.map((record) => (
                  <div key={record._id}>
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">
                            {formatDate(record.date)}
                          </p>

                          <StatusBadge status={record.status} />

                          {record.needsReview && (
                            <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                              Needs review
                            </span>
                          )}

                          {record.isAutoCheckout && (
                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                              Auto checkout
                            </span>
                          )}
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-4 sm:max-w-md">
                          <div>
                            <p className="text-xs text-slate-500">Check-in</p>
                            <p className="mt-1 text-sm font-medium text-slate-800">
                              {formatTime(record.checkInAt, record.timeZone)}
                            </p>
                            {record.checkInStatus && (
                              <p className="mt-1 text-xs text-slate-500">
                                {record.checkInStatus.replaceAll("_", " ")}
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">Check-out</p>
                            <p className="mt-1 text-sm font-medium text-slate-800">
                              {formatTime(record.checkOutAt, record.timeZone)}
                            </p>
                            {record.checkOutStatus && (
                              <p className="mt-1 text-xs text-slate-500">
                                {record.checkOutStatus}
                              </p>
                            )}
                          </div>
                        </div>

                        {record.checkInReason && (
                          <p className="mt-3 text-xs text-slate-500">
                            Check-in reason: {record.checkInReason}
                          </p>
                        )}

                        {record.checkOutNote && (
                          <p className="mt-1 text-xs text-slate-500">
                            Checkout note: {record.checkOutNote}
                          </p>
                        )}

                        {record.correctionReason && (
                          <p className="mt-2 text-xs text-blue-700">
                            Correction reason: {record.correctionReason}
                          </p>
                        )}

                        {record.reviewReason && (
                          <p className="mt-2 text-xs text-amber-700">
                            Review reason: {record.reviewReason}
                          </p>
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
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <FiEdit2 />
                        {editingRecord === record._id
                          ? "Close correction"
                          : "Correct"}
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

            {pagination && pagination.totalPages > 0 && (
              <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Page {pagination.page} of {pagination.totalPages}
                  {" · "}
                  {pagination.totalRecords} records
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1 || historyQuery.isFetching}
                    onClick={() => setPage((current) => current - 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <FiChevronLeft />
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={
                      page >= pagination.totalPages || historyQuery.isFetching
                    }
                    onClick={() => setPage((current) => current + 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Next
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
