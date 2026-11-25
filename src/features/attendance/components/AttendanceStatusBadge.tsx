import type { AttendanceRecord } from "../types/attendance.types";

interface AttendanceStatusBadgeProps {
  attendance: AttendanceRecord | null;
}

export function AttendanceStatusBadge({
  attendance,
}: AttendanceStatusBadgeProps) {
  if (!attendance?.checkInAt) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-600">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        Not checked in
      </span>
    );
  }

  if (attendance.checkOutAt) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Completed
      </span>
    );
  }

  const isLate = attendance.status === "late";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold ${
        isLate
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-[#DCE9B9] bg-[#F4F8E8] text-[#607B20]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isLate ? "bg-amber-500" : "bg-[#8EAC31]"
        }`}
      />
      {isLate ? "Checked in late" : "Present"}
    </span>
  );
}
