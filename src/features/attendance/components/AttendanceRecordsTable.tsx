import type { AdminAttendanceRecord } from "../types/attendance.types";

interface AttendanceRecordsTableProps {
  records: AdminAttendanceRecord[];
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

function StatusBadge({ status }: { status: AdminAttendanceRecord["status"] }) {
  const styles = {
    present: "bg-slate-100 text-slate-700",
    late: "bg-red-50 text-[#F40026]",
    absent: "bg-[#030708] text-white",
  };

  const labels = {
    present: "Present",
    late: "Late",
    absent: "Absent",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status === "late" && (
        <span className="h-1.5 w-1.5 rounded-full bg-[#F40026]" />
      )}
      {labels[status]}
    </span>
  );
}

function CheckInStatus({
  status,
}: {
  status?: AdminAttendanceRecord["checkInStatus"];
}) {
  if (!status) {
    return <span className="text-sm text-slate-400">—</span>;
  }

  const labels = {
    on_time: "On time",
    late_yellow: "Late (Yellow)",
    late_red: "Late (Red)",
  };

  const styles = {
    on_time: "text-slate-600",
    late_yellow: "text-[#F40026]",
    late_red: "font-semibold text-[#F40026]",
  };

  return (
    <span className={`text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export function AttendanceRecordsTable({
  records,
}: AttendanceRecordsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[950px] text-left text-sm">
        <thead className="bg-slate-50/80">
          <tr className="border-b border-slate-100">
            <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:px-6">
              Employee
            </th>

            <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Status
            </th>

            <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Check-in
            </th>

            <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Check-in type
            </th>

            <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Check-out
            </th>

            <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Review
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {records.map((record) => {
            const employee = record.employee;

            return (
              <tr
                key={record._id}
                className="transition-colors hover:bg-slate-50/70"
              >
                {/* Employee */}
                <td className="px-5 py-4 sm:px-6">
                  {employee ? (
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold uppercase text-slate-600">
                        {employee.fullName.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-[#030708]">
                          {employee.fullName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {employee.employeeCode}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {employee.phoneNumber}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">
                      Employee unavailable
                    </span>
                  )}
                </td>

                {/* Attendance status */}
                <td className="px-4 py-4">
                  <StatusBadge status={record.status} />
                </td>

                {/* Check-in */}
                <td className="px-4 py-4">
                  <p className="font-semibold tabular-nums text-[#030708]">
                    {formatTime(record.checkInAt, record.timeZone)}
                  </p>

                  {record.checkInReason && (
                    <p
                      className="mt-1 max-w-48 truncate text-xs text-[#F40026]"
                      title={record.checkInReason}
                    >
                      Reason: {record.checkInReason}
                    </p>
                  )}
                </td>

                {/* Check-in type */}
                <td className="px-4 py-4">
                  <CheckInStatus status={record.checkInStatus} />
                </td>

                {/* Check-out */}
                <td className="px-4 py-4">
                  <p className="font-semibold tabular-nums text-[#030708]">
                    {formatTime(record.checkOutAt, record.timeZone)}
                  </p>

                  {record.isAutoCheckout && (
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Automatic checkout
                    </p>
                  )}
                </td>

                {/* Review */}
                <td className="px-4 py-4">
                  {record.needsReview ? (
                    <div>
                      <span className="inline-flex items-center rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-[#F40026]">
                        Needs review
                      </span>

                      {record.reviewReason && (
                        <p
                          className="mt-1 max-w-36 truncate text-xs text-slate-500"
                          title={record.reviewReason}
                        >
                          {record.reviewReason}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
