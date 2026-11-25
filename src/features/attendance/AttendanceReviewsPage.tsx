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
  const styles = {
    present: "bg-green-100 text-green-700",
    late: "bg-amber-100 text-amber-700",
    absent: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
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
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Attendance Reviews
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review attendance records flagged for automatic checkout.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <FiRefreshCw className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <label
          htmlFor="review-date"
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          Filter by date
        </label>

        <div className="relative max-w-sm">
          <FiCalendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />

          <input
            id="review-date"
            type="date"
            value={date}
            onChange={(event) => handleDateChange(event.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {date && (
          <button
            type="button"
            onClick={() => handleDateChange("")}
            className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Clear date filter
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-1 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-slate-900">Pending reviews</h2>

          <p className="text-sm text-slate-500">
            {pagination?.totalRecords ?? 0} pending records
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
            <FiRefreshCw className="animate-spin" />
            Loading review queue...
          </div>
        ) : isError ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-red-600">{getErrorMessage(error)}</p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 text-sm font-medium text-blue-600"
            >
              Try again
            </button>
          </div>
        ) : records.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <FiCheckCircle className="mx-auto mb-3 text-3xl text-green-500" />

            <p className="font-medium text-slate-700">No pending reviews</p>

            <p className="mt-1 text-sm text-slate-500">
              There are no attendance records waiting for review.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {records.map((record) => {
              const employee = record.employee;

              return (
                <div key={record._id} className="space-y-4 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {employee?.fullName ?? "Employee unavailable"}
                      </p>

                      {employee && (
                        <p className="mt-1 text-sm text-slate-500">
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

                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={record.status} />

                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        Pending review
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-slate-500">Attendance date</p>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {record.date}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Check-in</p>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {formatTime(record.checkInAt, record.timeZone)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Check-out</p>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {formatTime(record.checkOutAt, record.timeZone)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      {record.isAutoCheckout && (
                        <p className="flex items-center gap-2 text-sm font-medium text-amber-700">
                          <FiClock />
                          Automatic checkout
                        </p>
                      )}

                      {record.reviewReason && (
                        <p className="flex items-start gap-2 text-sm text-slate-600">
                          <FiAlertCircle className="mt-0.5 shrink-0 text-amber-500" />
                          {record.reviewReason}
                        </p>
                      )}

                      {record.checkOutNote && (
                        <p className="text-sm text-slate-500">
                          Checkout note: {record.checkOutNote}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => reviewMutation.mutate(record._id)}
                      disabled={reviewMutation.isPending}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FiCheckCircle />
                      Mark as Reviewed
                    </button>
                  </div>
                </div>
              );
            })}
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
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <FiChevronLeft />
                Previous
              </button>

              <button
                type="button"
                disabled={page >= pagination.totalPages || isFetching}
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

      {reviewMutation.isError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {getErrorMessage(reviewMutation.error)}
        </p>
      )}
    </div>
  );
}
