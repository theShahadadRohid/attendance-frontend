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
  },
  {
    key: "present",
    label: "Present",
    icon: BiUserCheck,
  },
  {
    key: "late",
    label: "Late",
    icon: LuClock3,
  },
  {
    key: "absent",
    label: "Absent",
    icon: BiUserX,
  },
  {
    key: "notCheckedIn",
    label: "Not Checked In",
    icon: BiUserMinus,
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

  const formattedDate = dashboard
    ? new Date(`${dashboard.date}T00:00:00`).toLocaleDateString("en-BD", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="w-full space-y-7">
      {/* Page heading and controls */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#F40026]" />
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Overview
            </p>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#030708] sm:text-3xl">
            Dashboard
          </h1>

          <p className="mt-1.5 text-sm text-slate-500">
            Overview of employee attendance and daily activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex h-10 min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 transition focus-within:border-[#F40026] focus-within:ring-2 focus-within:ring-[#F40026]/10">
            <FaCalendarDays size={15} className="shrink-0 text-slate-500" />

            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              aria-label="Filter attendance by date"
              className="min-w-0 bg-transparent text-sm font-medium text-[#030708] outline-none"
            />
          </label>

          <button
            type="button"
            onClick={() => void dashboardQuery.refetch()}
            disabled={dashboardQuery.isFetching}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-[#030708] transition hover:border-[#F40026] hover:text-[#F40026] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F40026]/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiRefreshCw
              size={15}
              className={dashboardQuery.isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </section>

      {/* Loading state */}
      {dashboardQuery.isLoading && (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-8">
          <FiRefreshCw className="animate-spin text-2xl text-[#F40026]" />
          <p className="mt-3 text-sm font-medium text-slate-600">
            Loading dashboard...
          </p>
        </div>
      )}

      {/* Error state */}
      {dashboardQuery.isError && (
        <div className="rounded-xl border border-red-200 bg-white p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#F40026]">
              <BiUserX size={21} />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[#030708]">
                Unable to load dashboard
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Check your connection and Admin session, then try again.
              </p>

              <button
                type="button"
                onClick={() => void dashboardQuery.refetch()}
                className="mt-3 text-sm font-semibold text-[#F40026] transition hover:text-[#C90020] focus-visible:outline-none focus-visible:underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard content */}
      {dashboard && (
        <>
          {/* Attendance summary heading */}
          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-[#030708]">
                  Attendance Summary
                </h2>

                <p className="mt-1 text-sm text-slate-500">{formattedDate}</p>
              </div>

              <p className="text-xs font-medium text-slate-400">
                Daily overview
              </p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {cards.map((card) => {
                const Icon = card.icon;
                const value = dashboard.summary[card.key];

                return (
                  <div
                    key={card.key}
                    className="group rounded-xl border border-slate-200 bg-white p-5 transition duration-200 hover:border-slate-300 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[13px] font-medium text-slate-500">
                        {card.label}
                      </p>

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#F40026]">
                        <Icon size={18} />
                      </div>
                    </div>

                    <p className="mt-4 text-3xl font-bold tracking-tight tabular-nums text-[#030708]">
                      {value}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Employees not checked in */}
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
                {dashboard.notCheckedInEmployees.length} employees
              </span>
            </div>

            {dashboard.notCheckedInEmployees.length === 0 ? (
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
                {dashboard.notCheckedInEmployees.map((employee) => (
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
                          {employee.department
                            ? ` · ${employee.department}`
                            : ""}
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
        </>
      )}
    </div>
  );
}
