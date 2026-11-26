import { BiPhone } from "react-icons/bi";
import { FaUserCheck } from "react-icons/fa6";

import type { NotCheckedInEmployee } from "../types/dashboard.types";

interface NotCheckedInEmployeesProps {
  employees: NotCheckedInEmployee[];
}

export default function NotCheckedInEmployees({
  employees,
}: NotCheckedInEmployeesProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
        <div>
          <h2 className="text-base font-bold text-[#030708]">
            Employees Not Checked In
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Employees without an attendance record for this date.
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-[#F40026]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#F40026]" />
          {employees.length} employees
        </span>
      </div>

      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <FaUserCheck size={21} />
          </div>

          <p className="mt-4 text-sm font-semibold text-[#030708]">
            Everyone is accounted for
          </p>

          <p className="mt-1 text-sm text-slate-500">
            There are no employees in this list for the selected date.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {employees.map((employee) => (
            <div
              key={employee._id}
              className="flex flex-col justify-between gap-3 px-5 py-4 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:px-6"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold uppercase text-slate-600">
                  {employee.fullName.charAt(0)}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#030708]">
                    {employee.fullName}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {employee.employeeCode}
                    {employee.department ? ` · ${employee.department}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pl-[52px] text-sm text-slate-500 sm:pl-0">
                <BiPhone size={15} className="shrink-0" />
                <span>{employee.phoneNumber}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
