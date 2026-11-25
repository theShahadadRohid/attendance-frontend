import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../../features/auth/useAuth";

import {
  BiCalendarCheck,
  BiChevronRight,
  BiLogOut,
  BiMenu,
  BiX,
} from "react-icons/bi";
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

export default function EmployeeLayout() {
  const { employee, logoutEmployee } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    logoutEmployee();
    navigate("/employee/login", { replace: true });
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

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

      {/* Navigation */}
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
                    onClick={closeMobileMenu}
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

      {/* Logout */}
      <div className="border-t border-white/10 p-4">
        <button
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
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#030708] lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation"
            onClick={closeMobileMenu}
            className="absolute inset-0 bg-black/50"
          />

          <aside className="relative flex h-full w-72 flex-col bg-[#030708] shadow-2xl">
            <button
              onClick={closeMobileMenu}
              aria-label="Close menu"
              className="absolute right-4 top-6 z-10 rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <BiX size={20} />
            </button>

            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="min-h-screen lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation"
              className="rounded-lg p-2 text-[#030708] transition hover:bg-slate-100 lg:hidden"
            >
              <BiMenu size={22} />
            </button>

            <div>
              <p className="text-sm font-bold text-[#030708]">
                Employee Portal
              </p>
              <p className="text-xs text-slate-500">Attendance management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-[#030708]">
                {employee?.fullName || "Employee"}
              </p>
              <p className="text-xs text-slate-500">
                {employee?.designation || "Team Member"}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F40026]/10 text-sm font-bold uppercase text-[#F40026]">
              {employee?.fullName?.charAt(0) || "E"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-5rem)] bg-white p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
