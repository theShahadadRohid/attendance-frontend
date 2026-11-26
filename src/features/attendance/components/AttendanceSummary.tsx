import {
  FiAlertCircle,
  FiCalendar,
  FiClock,
  FiLogIn,
  FiLogOut,
} from "react-icons/fi";

import type { AttendanceRecord } from "../types/attendance.types";
import { formatTime, getCheckInLabel } from "../utils/attendance-formatters";
import { AttendanceStatusBadge } from "./AttendanceStatusBadge";

interface AttendanceSummaryProps {
  attendance: AttendanceRecord | null;
  date: string;
  timeZone: string;
}

export function AttendanceSummary({
  attendance,
  timeZone,
}: AttendanceSummaryProps) {
  const checkInLate =
    attendance?.checkInStatus === "late_yellow" ||
    attendance?.checkInStatus === "late_red";

  const checkOutLabel = attendance?.isAutoCheckout
    ? "Automatically checked out"
    : attendance?.checkOutStatus === "early"
      ? "Early checkout"
      : "Normal checkout";

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <FiCalendar className="text-[#F40026]" />
            Today's Attendance
          </div>
        </div>

        <AttendanceStatusBadge attendance={attendance} />
      </div>

      {/* Attendance timeline */}
      <div className="relative mt-6 space-y-4">
        {/* Connecting line */}
        <div className="absolute bottom-8 left-[17px] top-8 w-px bg-slate-200" />

        {/* Check-in */}
        <div className="relative flex items-start gap-3">
          <div
            className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-4 border-white ${
              attendance?.checkInAt
                ? "bg-[#F40026] text-white"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            <FiLogIn size={15} />
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#030708]">Check-in</p>

              {attendance?.checkInAt ? (
                <p
                  className={`mt-1 text-xs font-medium ${
                    checkInLate ? "text-[#F40026]" : "text-slate-500"
                  }`}
                >
                  {getCheckInLabel(attendance.checkInStatus)}
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-400">
                  Not checked in yet
                </p>
              )}
            </div>

            <p className="shrink-0 text-lg font-bold tracking-tight text-[#030708] sm:text-xl">
              {formatTime(attendance?.checkInAt, timeZone)}
            </p>
          </div>
        </div>

        {/* Check-out */}
        <div className="relative flex items-start gap-3">
          <div
            className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-4 border-white ${
              attendance?.checkOutAt
                ? "bg-[#030708] text-white"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            <FiLogOut size={15} />
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#030708]">Check-out</p>

              {attendance?.checkOutAt ? (
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {checkOutLabel}
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-400">
                  Not checked out yet
                </p>
              )}
            </div>

            <p className="shrink-0 text-lg font-bold tracking-tight text-[#030708] sm:text-xl">
              {formatTime(attendance?.checkOutAt, timeZone)}
            </p>
          </div>
        </div>
      </div>

      {/* Check-in reason */}
      {attendance?.checkInReason && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50/60 p-3.5">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="shrink-0 text-[#F40026]" size={15} />

            <strong className="text-xs font-semibold text-[#030708]">
              Late check-in reason
            </strong>
          </div>

          <p className="mt-2 pl-[23px] text-sm leading-5 text-slate-600">
            {attendance.checkInReason}
          </p>
        </div>
      )}

      {/* Checkout note */}
      {attendance?.checkOutNote && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
          <div className="flex items-center gap-2">
            <FiClock className="shrink-0 text-slate-500" size={15} />

            <strong className="text-xs font-semibold text-[#030708]">
              Checkout note
            </strong>
          </div>

          <p className="mt-2 pl-[23px] text-sm leading-5 text-slate-600">
            {attendance.checkOutNote}
          </p>
        </div>
      )}

      {/* Review notice */}
      {attendance?.needsReview && (
        <div className="mt-3 flex gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <FiAlertCircle className="mt-0.5 shrink-0 text-[#F40026]" />

          <div>
            <strong className="text-xs font-semibold">
              Attendance needs review
            </strong>
            <p className="mt-1 text-xs leading-5">
              {attendance.reviewReason ??
                "Your attendance record is awaiting admin review."}
            </p>
          </div>
        </div>
      )}

      {/* Auto checkout */}
      {attendance?.isAutoCheckout && (
        <div className="mt-3 flex gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <FiClock className="mt-0.5 shrink-0 text-slate-400" />
          <p>Your checkout was recorded automatically.</p>
        </div>
      )}
    </>
  );
}
