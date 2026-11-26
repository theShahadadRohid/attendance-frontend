import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useRegisterSW } from "virtual:pwa-register/react";

import { useAuth } from "./features/auth/useAuth";
import { AdminLoginPage } from "./features/auth/pages/AdminLoginPage";
import { EmployeeLoginPage } from "./features/auth/pages/EmployeeLoginPage";

import AdminLayout from "./layouts/admin/AdminLayout";
import EmployeeLayout from "./layouts/employee/EmployeeLayout";

import AdminDashboardPage from "./features/attendance/AdminDashboardPage";
import AdminAttendancePage from "./features/attendance/AdminAttendancePage";
import AttendanceReviewsPage from "./features/attendance/AttendanceReviewsPage";
import EmployeeAttendanceHistoryPage from "./features/attendance/EmployeeAttendanceHistoryPage";
import EmployeeDashboardPage from "./features/attendance/EmployeeDashboardPage";
import MyAttendanceHistoryPage from "./features/attendance/MyAttendanceHistoryPage";

import EmployeeManagementPage from "./features/employee/EmployeeManagementPage";
import EmployeeDetailsPage from "./features/employee/EmployeeDetailsPage";

import ScheduleManagementPage from "./features/schedule/ScheduleManagementPage";
import PasswordResetRequestsPage from "./features/auth/PasswordResetRequestsPage";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">
        This page is under development.
      </p>
    </div>
  );
}

function LoadingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <p className="text-sm text-slate-500">Checking your session...</p>
    </main>
  );
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { admin, employee, isInitializing } = useAuth();

  if (isInitializing) return <LoadingPage />;

  if (employee) {
    return <Navigate to="/employee/dashboard" replace />;
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function EmployeeRoute({ children }: { children: ReactNode }) {
  const { admin, employee, isInitializing } = useAuth();

  if (isInitializing) return <LoadingPage />;

  if (admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!employee) {
    return <Navigate to="/employee/login" replace />;
  }

  return children;
}

function GuestRoute({ children }: { children: ReactNode }) {
  const { admin, employee, isInitializing } = useAuth();

  if (isInitializing) return <LoadingPage />;

  if (admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (employee) {
    return <Navigate to="/employee/dashboard" replace />;
  }

  return children;
}

function App() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error("Service worker registration failed:", error);
    },
  });

  function dismissNotification() {
    setOfflineReady(false);
    setNeedRefresh(false);
  }

  return (
    <>
      <Routes>
        <Route
          path="/employee/login"
          element={
            <GuestRoute>
              <EmployeeLoginPage />
            </GuestRoute>
          }
        />

        {/* Guest routes */}
        <Route
          path="/admin/login"
          element={
            <GuestRoute>
              <AdminLoginPage />
            </GuestRoute>
          }
        />

        <Route
          path="/employee/login"
          element={
            <GuestRoute>
              <EmployeeLoginPage />
            </GuestRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<AdminDashboardPage />} />

          <Route path="employees" element={<EmployeeManagementPage />} />

          <Route
            path="employees/:employeeId"
            element={<EmployeeDetailsPage />}
          />

          <Route path="attendance" element={<AdminAttendancePage />} />

          <Route
            path="attendance/reviews"
            element={<AttendanceReviewsPage />}
          />

          <Route
            path="attendance/:employeeId"
            element={<EmployeeAttendanceHistoryPage />}
          />

          <Route path="schedule" element={<ScheduleManagementPage />} />

          <Route
            path="password-resets"
            element={<PasswordResetRequestsPage />}
          />
        </Route>

        {/* Employee routes */}
        <Route
          path="/employee"
          element={
            <EmployeeRoute>
              <EmployeeLayout />
            </EmployeeRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<EmployeeDashboardPage />} />

          <Route path="attendance" element={<MyAttendanceHistoryPage />} />

          <Route
            path="settings"
            element={<PlaceholderPage title="Account Settings" />}
          />
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={<PlaceholderPage title="404 - Page Not Found" />}
        />
      </Routes>

      {/* Global PWA notification */}
      {(needRefresh || offlineReady) && (
        <div
          className="fixed inset-x-4 bottom-24 z-[100] sm:bottom-6 sm:left-auto sm:right-6 sm:w-[380px]"
          role="status"
          aria-live="polite"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
            {needRefresh ? (
              <>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#F40026]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20 7v5h-5M4 17v-5h5M5.5 9a7 7 0 0 1 11.6-2L20 12M4 12l2.9 5a7 7 0 0 0 11.6-2"
                      />
                    </svg>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      Update available
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      A new version of the attendance app is ready. Update to
                      get the latest improvements.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={dismissNotification}
                    aria-label="Dismiss update notification"
                    className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <span aria-hidden="true">✕</span>
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={dismissNotification}
                    className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                  >
                    Later
                  </button>

                  <button
                    type="button"
                    onClick={() => void updateServiceWorker(true)}
                    className="rounded-lg bg-[#F40026] px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                  >
                    Update now
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <span className="text-lg">✓</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900">
                      App ready
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      App files are cached for offline loading. Attendance
                      actions still require an internet connection.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={dismissNotification}
                    aria-label="Dismiss notification"
                    className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <span aria-hidden="true">✕</span>
                  </button>
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={dismissNotification}
                    className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                  >
                    Got it
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
