import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminDashboardPage from "./features/attendance/AdminDashboardPage";
import { useAuth } from "./features/auth/useAuth";
import { AdminLoginPage, EmployeeLoginPage } from "./features/auth/LoginPages";

import AdminLayout from "./layouts/admin/AdminLayout";
import EmployeeManagementPage from "./features/employee/EmployeeManagementPage";
import EmployeeDetailsPage from "./features/employee/EmployeeDetailsPage";
import AdminAttendancePage from "./features/attendance/AdminAttendancePage";
import AttendanceReviewsPage from "./features/attendance/AttendanceReviewsPage";
import EmployeeAttendanceHistoryPage from "./features/attendance/EmployeeAttendanceHistoryPage";
import ScheduleManagementPage from "./features/schedule/ScheduleManagementPage";
import PasswordResetRequestsPage from "./features/auth/PasswordResetRequestsPage";
import EmployeeDashboardPage from "./features/attendance/EmployeeDashboardPage";

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
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/login" replace />} />

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

      {/* Admin routes with shared layout */}
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

        <Route path="employees/:employeeId" element={<EmployeeDetailsPage />} />

        <Route path="attendance" element={<AdminAttendancePage />} />

        <Route path="attendance/reviews" element={<AttendanceReviewsPage />} />

        <Route
          path="attendance/:employeeId"
          element={<EmployeeAttendanceHistoryPage />}
        />

        <Route path="schedule" element={<ScheduleManagementPage />} />

        <Route path="password-resets" element={<PasswordResetRequestsPage />} />
      </Route>

      {/* Employee routes */}
      <Route
        path="/employee/dashboard"
        element={
          <EmployeeRoute>
            <EmployeeDashboardPage />
          </EmployeeRoute>
        }
      />

      <Route
        path="/employee/attendance"
        element={
          <EmployeeRoute>
            <PlaceholderPage title="My Attendance History" />
          </EmployeeRoute>
        }
      />

      <Route
        path="/employee/settings"
        element={
          <EmployeeRoute>
            <PlaceholderPage title="Account Settings" />
          </EmployeeRoute>
        }
      />

      <Route
        path="*"
        element={<PlaceholderPage title="404 - Page Not Found" />}
      />
    </Routes>
  );
}

export default App;
