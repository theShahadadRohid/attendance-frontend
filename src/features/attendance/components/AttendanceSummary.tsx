import {
  FiAlertCircle,
  FiCalendar,
  FiClock,
  FiLogIn,
  FiLogOut,
} from "react-icons/fi";

import type { AttendanceRecord } from "../types/attendance.types";
import {
  formatDate,
  formatTime,
  getCheckInLabel,
} from "../utils/attendance-formatters";
import { AttendanceStatusBadge } from "./AttendanceStatusBadge";

interface AttendanceSummaryProps {
  attendance: AttendanceRecord | null;
  date: string;
  timeZone: string;
}

export function AttendanceSummary({
  attendance,
  date,
  timeZone,
}: AttendanceSummaryProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <FiCalendar className="text-[#F40026]" />
            Today's Attendance
          </div>

          <h2 className="mt-1.5 text-lg font-bold tracking-tight text-[#030708]">
            {formatDate(date, timeZone)}
          </h2>
        </div>

        <AttendanceStatusBadge attendance={attendance} />
      </div>

      {/* Attendance timeline */}
      <div className="relative mt-5 grid grid-cols-2 gap-3">
        <div className="absolute left-[25%] right-[25%] top-[19px] h-0.5 bg-slate-200" />

        {/* Check-in */}
        <div className="relative rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
          <div className="relative z-10 flex items-center gap-2 text-xs font-medium text-slate-500">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-4 border-white ${
                attendance?.checkInAt
                  ? "bg-[#F40026] text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              <FiLogIn />
            </span>
            Check-in
          </div>

          <p className="mt-3 text-xl font-bold tracking-tight text-[#030708] sm:text-2xl">
            {formatTime(attendance?.checkInAt, timeZone)}
          </p>

          {attendance?.checkInAt && (
            <p
              className={`mt-1.5 text-xs font-semibold ${
                attendance.checkInStatus === "late_yellow" ||
                attendance.checkInStatus === "late_red"
                  ? "text-[#F40026]"
                  : "text-slate-500"
              }`}
            >
              {getCheckInLabel(attendance.checkInStatus)}
            </p>
          )}
        </div>

        {/* Check-out */}
        <div className="relative rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
          <div className="relative z-10 flex items-center gap-2 text-xs font-medium text-slate-500">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-4 border-white ${
                attendance?.checkOutAt
                  ? "bg-[#030708] text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              <FiLogOut />
            </span>
            Check-out
          </div>

          <p className="mt-3 text-xl font-bold tracking-tight text-[#030708] sm:text-2xl">
            {formatTime(attendance?.checkOutAt, timeZone)}
          </p>

          {attendance?.checkOutAt && (
            <p className="mt-1.5 text-xs font-medium text-slate-500">
              {attendance.isAutoCheckout
                ? "Automatically checked out"
                : attendance.checkOutStatus === "early"
                  ? "Early checkout"
                  : "Normal checkout"}
            </p>
          )}
        </div>
      </div>

      {/* Check-in reason */}
      {attendance?.checkInReason && (
        <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <FiAlertCircle className="mt-0.5 shrink-0 text-[#F40026]" />

          <div>
            <strong className="text-xs font-semibold">
              Late check-in reason
            </strong>
            <p className="mt-1 text-xs leading-5">{attendance.checkInReason}</p>
          </div>
        </div>
      )}

      {/* Checkout note */}
      {attendance?.checkOutNote && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          <strong className="text-xs font-semibold text-[#030708]">
            Checkout note
          </strong>
          <p className="mt-1 text-xs leading-5">{attendance.checkOutNote}</p>
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
