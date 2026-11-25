import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiRefreshCw,
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

interface ReviewRecord {
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

interface ReviewQueueResponse {
  message: string;
  data: {
    filters: {
      date: string | null;
    };
    records: ReviewRecord[];
    pagination: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
    };
  };
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
    "Something went wrong."
  );
}

function StatusBadge({ status }: { status: ReviewRecord["status"] }) {
  const styles: Record<ReviewRecord["status"], string> = {
    present: "bg-slate-100 text-slate-700",
    late: "bg-red-50 text-[#F40026]",
    absent: "bg-[#030708] text-white",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function getInitials(name?: string) {
  if (!name) return "NA";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function AttendanceReviewsPage() {
  const queryClient = useQueryClient();

  const [date, setDate] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["attendance-reviews", date, page],
    queryFn: async () => {
      const response = await adminApi.get<ReviewQueueResponse>(
        "/attendance/reviews",
        {
          params: {
            ...(date && { date }),
            page,
            limit: 20,
          },
        },
      );

      return response.data.data;
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async (attendanceId: string) => {
      await adminApi.patch(`/attendance/${attendanceId}/review`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["attendance-reviews"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["admin-attendance"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["admin-dashboard"],
      });
    },
  });

  const records = data?.records ?? [];
  const pagination = data?.pagination;

  function handleDateChange(value: string) {
    setDate(value);
    setPage(1);
    reviewMutation.reset();
  }

  return (
    <div className="w-full space-y-7">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#F40026]" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Attendance Management
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#030708] sm:text-3xl">
            Attendance Reviews
          </h1>

          <p className="mt-1.5 text-sm text-slate-500">
            Review and confirm attendance records flagged for manual review.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#030708] transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
        >
          <FiRefreshCw className={isFetching ? "animate-spin" : ""} size={16} />
          Refresh
        </button>
      </div>

      {/* Date filter */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-[#030708]">
            Filter reviews
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Find attendance records by attendance date.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full sm:max-w-xs">
            <label
              htmlFor="review-date"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Attendance date
            </label>

            <div className="relative">
              <FiCalendar
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />

              <input
                id="review-date"
                type="date"
                value={date}
                onChange={(event) => handleDateChange(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#F40026] focus:ring-2 focus:ring-[#F40026]/10"
              />
            </div>
          </div>

          {date && (
            <button
              type="button"
              onClick={() => handleDateChange("")}
              className="self-start rounded-lg px-3 py-2.5 text-sm font-semibold text-[#F40026] transition hover:bg-red-50 sm:self-auto"
            >
              Clear date filter
            </button>
          )}
        </div>
      </section>

      {/* Review queue */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="font-semibold text-[#030708]">Pending reviews</h2>
            <p className="mt-1 text-xs text-slate-500">
              Attendance records that require your attention.
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-[#F40026]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F40026]" />
            {pagination?.totalRecords ?? 0} pending records
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <FiRefreshCw
              className="mb-3 animate-spin text-[#F40026]"
              size={24}
            />
            <p className="text-sm font-medium text-slate-700">
              Loading review queue...
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Please wait while we fetch attendance records.
            </p>
          </div>
        ) : isError ? (
          <div className="px-4 py-14 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-[#F40026]">
              <FiAlertCircle size={21} />
            </div>

            <p className="font-semibold text-[#030708]">
              Unable to load reviews
            </p>

            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              {getErrorMessage(error)}
            </p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#F40026] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <FiRefreshCw size={15} />
              Try again
            </button>
          </div>
        ) : records.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <FiCheckCircle size={24} />
            </div>

            <p className="font-semibold text-[#030708]">No pending reviews</p>

            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              There are no attendance records waiting for review. Everything is
              up to date.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {records.map((record) => {
              const employee = record.employee;

              return (
                <article
                  key={record._id}
                  className="space-y-4 p-4 transition-colors hover:bg-slate-50/50 sm:p-5"
                >
                  {/* Employee and status */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#030708] text-xs font-bold text-white">
                        {getInitials(employee?.fullName)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#030708]">
                          {employee?.fullName ?? "Employee unavailable"}
                        </p>

                        {employee && (
                          <p className="mt-1 text-xs text-slate-500">
                            {employee.employeeCode}
                            {" · "}
                            {employee.phoneNumber}
                          </p>
                        )}

                        {employee?.department && (
                          <p className="mt-1 text-xs text-slate-400">
                            {employee.department}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <StatusBadge status={record.status} />

                      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-semibold text-[#F40026]">
                        <FiAlertCircle size={12} />
                        Pending review
                      </span>
                    </div>
                  </div>

                  {/* Attendance details */}
                  <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3 sm:grid-cols-3 sm:p-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Attendance date
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-[#030708]">
                        {record.date}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Check-in
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-[#030708]">
                        {formatTime(record.checkInAt, record.timeZone)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Check-out
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-[#030708]">
                        {formatTime(record.checkOutAt, record.timeZone)}
                      </p>
                    </div>
                  </div>

                  {/* Review reason and action */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="min-w-0 flex-1 space-y-2">
                      {record.isAutoCheckout && (
                        <p className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <FiClock className="shrink-0 text-[#F40026]" />
                          Automatic checkout
                        </p>
                      )}

                      {record.reviewReason && (
                        <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50/70 p-3 text-sm text-slate-700">
                          <FiAlertCircle
                            className="mt-0.5 shrink-0 text-[#F40026]"
                            size={16}
                          />
                          <span>{record.reviewReason}</span>
                        </div>
                      )}

                      {record.checkOutNote && (
                        <p className="text-sm text-slate-500">
                          <span className="font-medium text-slate-700">
                            Checkout note:
                          </span>{" "}
                          {record.checkOutNote}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => reviewMutation.mutate(record._id)}
                      disabled={reviewMutation.isPending}
                      className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#F40026] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {reviewMutation.isPending ? (
                        <>
                          <FiRefreshCw className="animate-spin" size={15} />
                          Processing...
                        </>
                      ) : (
                        <>
                          <FiCheckCircle size={16} />
                          Mark as Reviewed
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-sm text-slate-500">
              Page{" "}
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
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiChevronLeft size={16} />
                Previous
              </button>

              <button
                type="button"
                disabled={page >= pagination.totalPages || isFetching}
                onClick={() => setPage((current) => current + 1)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Mutation error */}
      {reviewMutation.isError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <FiAlertCircle className="mt-0.5 shrink-0" size={16} />
          <p>{getErrorMessage(reviewMutation.error)}</p>
        </div>
      )}
    </div>
  );
}
