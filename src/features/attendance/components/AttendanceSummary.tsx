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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <FiCalendar className="text-[#8EAC31]" />
            Today's Attendance
          </div>

          <h2 className="mt-2 text-lg font-bold tracking-tight text-[#171719]">
            {formatDate(date, timeZone)}
          </h2>
        </div>

        <AttendanceStatusBadge attendance={attendance} />
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 transition hover:border-[#D3F269]">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0F6DE] text-[#789522]">
              <FiLogIn />
            </span>
            Check-in
          </div>

          <p className="mt-4 text-2xl font-bold tracking-tight text-[#171719]">
            {formatTime(attendance?.checkInAt, timeZone)}
          </p>

          {attendance?.checkInAt && (
            <p className="mt-2 text-xs font-medium text-slate-500">
              {getCheckInLabel(attendance.checkInStatus)}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 transition hover:border-[#D3F269]">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0F6DE] text-[#789522]">
              <FiLogOut />
            </span>
            Check-out
          </div>

          <p className="mt-4 text-2xl font-bold tracking-tight text-[#171719]">
            {formatTime(attendance?.checkOutAt, timeZone)}
          </p>

          {attendance?.checkOutAt && (
            <p className="mt-2 text-xs font-medium text-slate-500">
              {attendance.isAutoCheckout
                ? "Automatically checked out"
                : attendance.checkOutStatus === "early"
                  ? "Early checkout"
                  : "Normal checkout"}
            </p>
          )}
        </div>
      </div>

      {attendance?.checkInReason && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-800">
          <strong>Check-in reason:</strong> {attendance.checkInReason}
        </div>
      )}

      {attendance?.checkOutNote && (
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-800">
          <strong>Checkout note:</strong> {attendance.checkOutNote}
        </div>
      )}

      {attendance?.needsReview && (
        <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <FiAlertCircle className="mt-0.5 shrink-0" />

          <div>
            <strong>Attendance needs review</strong>
            <p className="mt-1">
              {attendance.reviewReason ??
                "Your attendance record is awaiting admin review."}
            </p>
          </div>
        </div>
      )}

      {attendance?.isAutoCheckout && (
        <div className="mt-4 flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <FiClock className="mt-0.5 shrink-0 text-slate-400" />
          Your checkout was recorded automatically.
        </div>
      )}
    </>
  );
}
