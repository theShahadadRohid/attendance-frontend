import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../../features/auth/useAuth";
import leadLogo from "../../assets/lead.png";
import { LuKeyRound, LuLayoutDashboard } from "react-icons/lu";
import { FaCalendarDays, FaUser } from "react-icons/fa6";
import {
  BiCalendarCheck,
  BiChevronRight,
  BiLogOut,
  BiMenu,
  BiX,
} from "react-icons/bi";
import { BsClipboardCheck } from "react-icons/bs";

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
    setMobileMenuOpen(false);
    navigate("/admin/login", { replace: true });
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="flex h-20 shrink-0 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl">
          <img src={leadLogo} alt="" />
        </div>

        <div className="min-w-0">
          <h1 className="text-[15px] font-bold tracking-tight text-white">
            Lead Bangladesh
          </h1>
          <p className="mt-0.5 text-[11px] font-medium text-slate-400">
            Management System
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-6">
        {navigation.map((section) => (
          <div key={section.label} className="mb-7 last:mb-0">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
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
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors duration-150",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F40026] focus-visible:ring-offset-2 focus-visible:ring-offset-[#030708]",
                        isActive
                          ? "bg-[#F40026] text-white"
                          : "text-slate-400 hover:bg-white/[0.06] hover:text-white",
                      ].join(" ")
                    }
                  >
                    <Icon size={18} className="shrink-0" strokeWidth={1.8} />

                    <span className="min-w-0 flex-1">{item.name}</span>

                    <BiChevronRight
                      size={16}
                      className="shrink-0 opacity-0 transition group-hover:opacity-60"
                    />
                  </NavLink>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Sign out */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F40026]"
        >
          <BiLogOut size={19} />
          Sign out
        </button>
      </div>
    </>
  );

  const adminInitial = admin?.fullName?.trim()?.charAt(0) || "A";

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-[#030708]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-[#030708] lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={closeMobileMenu}
            className="absolute inset-0 bg-black/60"
          />

          <aside
            id="admin-mobile-navigation"
            className="relative flex h-full w-[min(288px,85vw)] flex-col bg-[#030708] shadow-2xl"
          >
            <button
              type="button"
              onClick={closeMobileMenu}
              aria-label="Close menu"
              className="absolute right-3 top-5 z-10 rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F40026]"
            >
              <BiX size={21} />
            </button>

            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="min-h-screen lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation"
              aria-expanded={mobileMenuOpen}
              aria-controls="admin-mobile-navigation"
              className="rounded-lg p-2 text-[#030708] transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F40026] lg:hidden"
            >
              <BiMenu size={22} />
            </button>

            <div className="min-w-0">
              <p className="text-sm font-bold text-[#030708]">
                Lead Bangladesh - Admin Panel
              </p>
              <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">
                Attendance Management System
              </p>
            </div>
          </div>

          {/* Admin profile */}
          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[13px] font-semibold text-[#030708]">
                {admin?.fullName || "Administrator"}
              </p>
              <p className="mt-0.5 text-[11px] capitalize text-slate-500">
                {admin?.role?.replaceAll("_", " ") || "Admin"}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#030708] text-sm font-bold uppercase text-white ring-2 ring-slate-100">
              {adminInitial}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-72px)] w-full p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
