import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { adminApi } from "../../lib/api";
import { FaUser } from "react-icons/fa";
import { BiPhone, BiUserCheck, BiUserMinus, BiUserX } from "react-icons/bi";
import { LuClock3 } from "react-icons/lu";
import { FaCalendarDays, FaUserCheck } from "react-icons/fa6";
import { FiRefreshCw } from "react-icons/fi";

interface DashboardSummary {
  totalEmployees: number;
  present: number;
  late: number;
  absent: number;
  notCheckedIn: number;
}

interface NotCheckedInEmployee {
  _id: string;
  employeeCode: string;
  fullName: string;
  phoneNumber: string;
  department?: string;
}

interface DashboardData {
  date: string;
  summary: DashboardSummary;
  notCheckedInEmployees: NotCheckedInEmployee[];
}

interface DashboardApiResponse {
  message: string;
  data: DashboardData;
}

function getLocalDateString() {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

const cards = [
  {
    key: "totalEmployees",
    label: "Total Employees",
    icon: FaUser,
    style: "bg-slate-100 text-slate-600",
  },
  {
    key: "present",
    label: "Present",
    icon: BiUserCheck,
    style: "bg-emerald-50 text-emerald-600",
  },
  {
    key: "late",
    label: "Late",
    icon: LuClock3,
    style: "bg-amber-50 text-amber-600",
  },
  {
    key: "absent",
    label: "Absent",
    icon: BiUserX,
    style: "bg-red-50 text-red-600",
  },
  {
    key: "notCheckedIn",
    label: "Not Checked In",
    icon: BiUserMinus,
    style: "bg-orange-50 text-orange-600",
  },
] as const;

export default function AdminDashboardPage() {
  const [date, setDate] = useState(getLocalDateString);

  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard", date],
    queryFn: async () => {
      const response = await adminApi.get<DashboardApiResponse>(
        "/attendance/dashboard",
        { params: { date } },
      );

      return response.data.data;
    },
  });

  const dashboard = dashboardQuery.data;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Overview of employee attendance and daily activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
            <FaCalendarDays size={17} className="text-slate-500" />
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="bg-transparent text-sm outline-none"
            />
          </label>

          <button
            onClick={() => void dashboardQuery.refetch()}
            disabled={dashboardQuery.isFetching}
            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            <FiRefreshCw
              size={16}
              className={dashboardQuery.isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {dashboardQuery.isLoading && (
        <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500">
          Loading dashboard...
        </div>
      )}

      {dashboardQuery.isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="font-semibold text-red-800">Unable to load dashboard</p>
          <p className="mt-1 text-sm text-red-700">
            Check your connection and Admin session.
          </p>
          <button
            onClick={() => void dashboardQuery.refetch()}
            className="mt-3 text-sm font-semibold text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {dashboard && (
        <>
          <div>
            <h2 className="font-semibold text-slate-800">Attendance Summary</h2>
            <p className="mt-1 text-sm text-slate-500">
              {new Date(`${dashboard.date}T00:00:00`).toLocaleDateString(
                "en-BD",
                { day: "numeric", month: "long", year: "numeric" },
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.key}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">
                      {card.label}
                    </p>
                    <div className={`rounded-xl p-3 ${card.style}`}>
                      <Icon size={19} />
                    </div>
                  </div>

                  <p className="mt-4 text-3xl font-bold text-slate-900">
                    {dashboard.summary[card.key]}
                  </p>
                </div>
              );
            })}
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Employees Not Checked In
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Employees without an attendance record for this date.
                </p>
              </div>

              <span className="w-fit rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700">
                {dashboard.notCheckedInEmployees.length} employees
              </span>
            </div>

            {dashboard.notCheckedInEmployees.length === 0 ? (
              <div className="p-10 text-center">
                <FaUserCheck size={28} className="mx-auto text-emerald-600" />
                <p className="mt-3 font-medium text-slate-800">
                  No employees in this list
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {dashboard.notCheckedInEmployees.map((employee) => (
                  <div
                    key={employee._id}
                    className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600">
                        {employee.fullName.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {employee.fullName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {employee.employeeCode}
                          {employee.department
                            ? ` · ${employee.department}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <BiPhone size={15} />
                      {employee.phoneNumber}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
