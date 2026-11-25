import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../../features/auth/useAuth";
import { LuKeyRound, LuLayoutDashboard } from "react-icons/lu";
import { FaCalendarDays, FaUser } from "react-icons/fa6";
import {
  BiCalendarCheck,
  BiChevronRight,
  BiLogOut,
  BiMenu,
  BiX,
} from "react-icons/bi";
import { BsClipboardCheck, BsShieldCheck } from "react-icons/bs";

const navigation = [
  {
    label: "Overview",
    items: [
      {
        name: "Dashboard",
        path: "/admin/dashboard",
        icon: LuLayoutDashboard,
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        name: "Employees",
        path: "/admin/employees",
        icon: FaUser,
      },
      {
        name: "Attendance",
        path: "/admin/attendance",
        icon: BiCalendarCheck,
      },
      {
        name: "Attendance Reviews",
        path: "/admin/attendance/reviews",
        icon: BsClipboardCheck,
      },
    ],
  },
  {
    label: "Configuration",
    items: [
      {
        name: "Schedule & Holidays",
        path: "/admin/schedule",
        icon: FaCalendarDays,
      },
      {
        name: "Password Requests",
        path: "/admin/password-resets",
        icon: LuKeyRound,
      },
    ],
  },
];

export default function AdminLayout() {
  const { admin, logoutAdmin } = useAuth();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    logoutAdmin();
    navigate("/admin/login", { replace: true });
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  const sidebarContent = (
    <>
      <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <BsShieldCheck size={22} />
        </div>

        <div>
          <h1 className="text-base font-bold tracking-tight text-white">
            Attendance
          </h1>
          <p className="text-xs text-slate-400">Management System</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {navigation.map((section) => (
          <div key={section.label} className="mb-7">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
              {section.label}
            </p>

            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/admin/attendance"}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      [
                        "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition",
                        isActive
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/20"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white",
                      ].join(" ")
                    }
                  >
                    <Icon size={19} strokeWidth={1.8} />

                    <span className="flex-1">{item.name}</span>

                    <BiChevronRight
                      size={15}
                      className="opacity-0 transition group-hover:opacity-60"
                    />
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-800 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <BiLogOut size={19} />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-slate-950 lg:flex">
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

          <aside className="relative flex h-full w-72 flex-col bg-slate-950 shadow-2xl">
            <button
              onClick={closeMobileMenu}
              aria-label="Close menu"
              className="absolute right-4 top-6 z-10 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
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
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <BiMenu size={22} />
            </button>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Admin Panel
              </p>
              <p className="text-xs text-slate-500">Attendance management</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {admin?.fullName || "Administrator"}
              </p>
              <p className="text-xs capitalize text-slate-500">
                {admin?.role?.replaceAll("_", " ") || "Admin"}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold uppercase text-indigo-700">
              {admin?.fullName?.charAt(0) || "A"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
