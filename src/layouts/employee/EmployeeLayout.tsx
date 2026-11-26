import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../../features/auth/useAuth";

import { BiCalendarCheck, BiChevronRight, BiLogOut, BiX } from "react-icons/bi";
import { LuLayoutDashboard, LuSettings } from "react-icons/lu";
import { BsShieldCheck } from "react-icons/bs";

const navigation = [
  {
    label: "Overview",
    items: [
      {
        name: "Dashboard",
        path: "/employee/dashboard",
        icon: LuLayoutDashboard,
      },
      {
        name: "My Attendance",
        path: "/employee/attendance",
        icon: BiCalendarCheck,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        name: "Account Settings",
        path: "/employee/settings",
        icon: LuSettings,
      },
    ],
  },
];

const mobileNavigation = [
  {
    name: "Dashboard",
    path: "/employee/dashboard",
    icon: LuLayoutDashboard,
  },
  {
    name: "Attendance",
    path: "/employee/attendance",
    icon: BiCalendarCheck,
  },
  {
    name: "Settings",
    path: "/employee/settings",
    icon: LuSettings,
  },
];

export default function EmployeeLayout() {
  const { employee, logoutEmployee } = useAuth();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);

  function handleLogout() {
    logoutEmployee();
    navigate("/employee/login", { replace: true });
  }

  const employeeInitial =
    employee?.fullName?.trim()?.charAt(0).toUpperCase() || "E";

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F40026] text-white">
          <BsShieldCheck size={22} />
        </div>

        <div>
          <h1 className="text-base font-bold tracking-tight text-white">
            Attendance
          </h1>
          <p className="text-xs text-white/50">Employee Portal</p>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {navigation.map((section) => (
          <div key={section.label} className="mb-7">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/40">
              {section.label}
            </p>

            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      [
                        "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
                        isActive
                          ? "bg-[#F40026] text-white shadow-lg shadow-black/20"
                          : "text-white/60 hover:bg-white/10 hover:text-white",
                      ].join(" ")
                    }
                  >
                    <Icon size={19} />

                    <span className="flex-1">{item.name}</span>

                    <BiChevronRight
                      size={15}
                      className="opacity-0 transition group-hover:opacity-70"
                    />
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Desktop Logout */}
      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-white/60 transition hover:bg-[#F40026]/10 hover:text-[#F40026]"
        >
          <BiLogOut size={19} />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#030708] lg:flex">
        {sidebarContent}
      </aside>

      {/* Main Area */}
      <div className="min-h-screen lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:h-20 lg:px-8">
          <div>
            <p className="text-sm font-bold text-[#030708]">Employee Portal</p>
            <p className="text-xs text-slate-500">Attendance management</p>
          </div>

          {/* Desktop Employee Info */}
          <div className="hidden items-center gap-3 lg:flex">
            <div className="text-right">
              <p className="text-sm font-semibold text-[#030708]">
                {employee?.fullName || "Employee"}
              </p>
              <p className="text-xs text-slate-500">
                {employee?.designation || "Team Member"}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F40026]/10 text-sm font-bold uppercase text-[#F40026]">
              {employeeInitial}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)] bg-white p-4 pb-28 sm:p-6 sm:pb-28 lg:min-h-[calc(100vh-5rem)] lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pt-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {mobileNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[10px] font-semibold transition",
                    isActive
                      ? "text-[#F40026]"
                      : "text-slate-400 hover:text-[#030708]",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={21}
                      className={isActive ? "text-[#F40026]" : ""}
                    />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}

          {/* Profile Button */}
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            aria-label="Open profile"
            aria-expanded={profileOpen}
            className={[
              "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[10px] font-semibold transition",
              profileOpen
                ? "text-[#F40026]"
                : "text-slate-400 hover:text-[#030708]",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold uppercase transition",
                profileOpen
                  ? "bg-[#F40026] text-white"
                  : "bg-slate-100 text-slate-600",
              ].join(" ")}
            >
              {employeeInitial}
            </span>
            <span>Profile</span>
          </button>
        </div>
      </nav>

      {/* Mobile Profile Backdrop */}
      {profileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close profile"
            onClick={() => setProfileOpen(false)}
            className="absolute inset-0 bg-black/40"
          />

          {/* Profile Bottom Sheet */}
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-profile-title"
            className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-slate-200 bg-white px-5 pt-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2
                id="employee-profile-title"
                className="text-base font-bold text-[#030708]"
              >
                My Profile
              </h2>

              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                aria-label="Close profile"
                className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
              >
                <BiX size={20} />
              </button>
            </div>

            {/* Employee Information */}
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F40026]/10 text-lg font-bold uppercase text-[#F40026]">
                {employeeInitial}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#030708]">
                  {employee?.fullName || "Employee"}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {employee?.designation || "Team Member"}
                </p>
              </div>
            </div>

            {/* Profile Actions */}
            <div className="mt-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl border border-red-100 px-4 py-3.5 text-sm font-semibold text-[#F40026] transition hover:bg-red-50"
              >
                <BiLogOut size={19} />
                Sign out
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
