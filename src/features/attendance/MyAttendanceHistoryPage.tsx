import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FiAlertCircle,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiRefreshCw,
} from "react-icons/fi";
import { employeeApi } from "../../lib/api";

interface AttendanceRecord {
  _id: string;
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
}

interface AttendanceHistoryResponse {
  employee: {
    _id: string;
    employeeCode: string;
    fullName: string;
    phoneNumber: string;
    employmentType: string;
    department?: string;
    isActive: boolean;
  };
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
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

function formatDate(date: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone,
  }).format(new Date(`${date}T12:00:00.000Z`));
}

function formatTime(value: string | undefined, timeZone: string) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-BD", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  }).format(new Date(value));
}

function getErrorMessage(error: unknown) {
  const response = (
    error as {
      response?: {
        data?: {
          message?: string;
          error?: { message?: string };
        };
      };
    }
  )?.response?.data;

  return (
    response?.message ??
    response?.error?.message ??
    "Unable to load attendance history."
  );
}

function StatusBadge({ status }: { status: AttendanceRecord["status"] }) {
  const styles = {
    present: "bg-emerald-50 text-emerald-700",
    late: "bg-amber-50 text-amber-700",
    absent: "bg-red-50 text-red-700",
  };

  const labels = {
    present: "Present",
    late: "Late",
    absent: "Absent",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function CheckInBadge({
  status,
}: {
  status?: AttendanceRecord["checkInStatus"];
}) {
  if (!status) return <span className="text-slate-400">—</span>;

  const isOnTime = status === "on_time";

  return (
    <span
      className={`text-xs font-semibold ${
        isOnTime ? "text-emerald-700" : "text-amber-700"
      }`}
    >
      {isOnTime ? "On time" : status === "late_yellow" ? "Late" : "Very late"}
    </span>
  );
}

function AttendanceCard({ record }: { record: AttendanceRecord }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">
            {formatDate(record.date, record.timeZone)}
          </p>
          <p className="mt-1 text-xs text-slate-500">{record.date}</p>
        </div>
        <StatusBadge status={record.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-500">Check-in</p>
          <p className="mt-1 font-semibold text-slate-900">
            {formatTime(record.checkInAt, record.timeZone)}
          </p>
          <CheckInBadge status={record.checkInStatus} />
        </div>

        <div>
          <p className="text-xs text-slate-500">Check-out</p>
          <p className="mt-1 font-semibold text-slate-900">
            {formatTime(record.checkOutAt, record.timeZone)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {record.isAutoCheckout
              ? "Automatic"
              : record.checkOutStatus === "early"
                ? "Early"
                : record.checkOutStatus === "normal"
                  ? "Normal"
                  : "—"}
          </p>
        </div>
      </div>

      {(record.checkInReason ||
        record.checkOutNote ||
        record.needsReview ||
        record.correctionReason) && (
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
          {record.checkInReason && (
            <p className="text-sm text-slate-600">
              <span className="font-semibold">Check-in reason:</span>{" "}
              {record.checkInReason}
            </p>
          )}

          {record.checkOutNote && (
            <p className="text-sm text-slate-600">
              <span className="font-semibold">Checkout note:</span>{" "}
              {record.checkOutNote}
            </p>
          )}

          {record.correctionReason && (
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Correction:</span>{" "}
              {record.correctionReason}
            </p>
          )}

          {record.needsReview && (
            <p className="text-sm font-medium text-amber-700">
              Awaiting admin review
              {record.reviewReason ? `: ${record.reviewReason}` : ""}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

export default function MyAttendanceHistoryPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["employee-attendance-history", appliedFrom, appliedTo, page],
    queryFn: async () => {
      const response = await employeeApi.get<
        ApiResponse<AttendanceHistoryResponse>
      >("/employee/attendance/history", {
        params: {
          ...(appliedFrom && { from: appliedFrom }),
          ...(appliedTo && { to: appliedTo }),
          page,
          limit: 20,
        },
      });

      return response.data.data;
    },
  });

  function applyFilters() {
    if (from && to && from > to) return;

    setPage(1);
    setAppliedFrom(from);
    setAppliedTo(to);
  }

  function clearFilters() {
    setFrom("");
    setTo("");
    setAppliedFrom("");
    setAppliedTo("");
    setPage(1);
  }

  const pagination = data?.pagination;
  const hasPreviousPage = page > 1;
  const hasNextPage = page < (pagination?.totalPages ?? 0);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Employee Portal
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              My Attendance History
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review your previous attendance records.
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <FiRefreshCw className={isFetching ? "animate-spin" : ""} />
            Refresh
          </button>
        </header>

        {data?.employee && (
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">
              {data.employee.fullName}
            </h2>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
              <span>{data.employee.employeeCode}</span>
              <span>{data.employee.phoneNumber}</span>
              {data.employee.department && (
                <span>{data.employee.department}</span>
              )}
            </div>
          </section>
        )}

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <FiCalendar className="text-slate-500" />
            <h2 className="font-semibold text-slate-900">Filter attendance</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end">
            <div>
              <label
                htmlFor="attendance-from"
                className="mb-2 block text-sm font-medium text-slate-600"
              >
                From
              </label>
              <input
                id="attendance-from"
                type="date"
                value={from}
                max={to || undefined}
                onChange={(event) => setFrom(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label
                htmlFor="attendance-to"
                className="mb-2 block text-sm font-medium text-slate-600"
              >
                To
              </label>
              <input
                id="attendance-to"
                type="date"
                value={to}
                min={from || undefined}
                onChange={(event) => setTo(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <button
              onClick={applyFilters}
              disabled={Boolean(from && to && from > to)}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply filters
            </button>

            <button
              onClick={clearFilters}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Clear
            </button>
          </div>

          {from && to && from > to && (
            <p className="mt-3 text-sm text-red-600">
              The start date cannot be later than the end date.
            </p>
          )}
        </section>

        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Loading attendance history...
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-100 bg-white p-8 text-center">
            <FiAlertCircle className="mx-auto text-3xl text-red-500" />
            <p className="mt-3 text-sm text-red-700">
              {getErrorMessage(error)}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-slate-900">
                Attendance records
              </h2>
              <p className="text-sm text-slate-500">
                {pagination?.totalRecords ?? 0} total records
              </p>
            </div>

            {data?.records.length ? (
              <>
                <div className="space-y-4 md:hidden">
                  {data.records.map((record) => (
                    <AttendanceCard key={record._id} record={record} />
                  ))}
                </div>

                <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                          <th className="px-5 py-4 font-semibold">Date</th>
                          <th className="px-5 py-4 font-semibold">Status</th>
                          <th className="px-5 py-4 font-semibold">Check-in</th>
                          <th className="px-5 py-4 font-semibold">Check-out</th>
                          <th className="px-5 py-4 font-semibold">Details</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {data.records.map((record) => (
                          <tr key={record._id} className="hover:bg-slate-50">
                            <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-800">
                              {formatDate(record.date, record.timeZone)}
                            </td>

                            <td className="px-5 py-4">
                              <StatusBadge status={record.status} />
                            </td>

                            <td className="whitespace-nowrap px-5 py-4">
                              <p className="font-medium text-slate-800">
                                {formatTime(record.checkInAt, record.timeZone)}
                              </p>
                              <CheckInBadge status={record.checkInStatus} />
                            </td>

                            <td className="whitespace-nowrap px-5 py-4">
                              <p className="font-medium text-slate-800">
                                {formatTime(record.checkOutAt, record.timeZone)}
                              </p>
                              <p className="text-xs text-slate-500">
                                {record.isAutoCheckout
                                  ? "Automatic"
                                  : (record.checkOutStatus ?? "—")}
                              </p>
                            </td>

                            <td className="max-w-xs px-5 py-4 text-xs text-slate-600">
                              {record.needsReview && (
                                <p className="mb-1 font-semibold text-amber-700">
                                  Awaiting review
                                </p>
                              )}
                              {record.isAutoCheckout && (
                                <p className="mb-1">Auto-checkout</p>
                              )}
                              {record.checkInReason && (
                                <p>Reason: {record.checkInReason}</p>
                              )}
                              {record.checkOutNote && (
                                <p>Note: {record.checkOutNote}</p>
                              )}
                              {record.correctionReason && (
                                <p className="text-blue-700">
                                  Correction: {record.correctionReason}
                                </p>
                              )}
                              {!record.needsReview &&
                                !record.isAutoCheckout &&
                                !record.checkInReason &&
                                !record.checkOutNote &&
                                !record.correctionReason &&
                                "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white px-5 py-12 text-center">
                <FiClock className="mx-auto text-3xl text-slate-300" />
                <h3 className="mt-3 font-semibold text-slate-800">
                  No attendance records found
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Try another date range or clear your filters.
                </p>
              </div>
            )}

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-slate-500">
                  Page {pagination.page} of {pagination.totalPages}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((current) => current - 1)}
                    disabled={!hasPreviousPage}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <FiChevronLeft />
                    Previous
                  </button>

                  <button
                    onClick={() => setPage((current) => current + 1)}
                    disabled={!hasNextPage}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
