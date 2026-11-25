import type { AttendanceRecord } from "../types/attendance.types";

interface AttendanceStatusBadgeProps {
  attendance: AttendanceRecord | null;
}

export function AttendanceStatusBadge({
  attendance,
}: AttendanceStatusBadgeProps) {
  if (!attendance?.checkInAt) {
    return (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        Not checked in
      </span>
    );
  }

  if (attendance.checkOutAt) {
    return (
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        Completed
      </span>
    );
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        attendance.status === "late"
          ? "bg-amber-50 text-amber-700"
          : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {attendance.status === "late" ? "Checked in late" : "Present"}
    </span>
  );
}
