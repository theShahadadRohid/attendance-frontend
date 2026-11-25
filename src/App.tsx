import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLoginPage, EmployeeLoginPage } from "./features/auth/LoginPages";
import { useAuth } from "./features/auth/useAuth";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          This page is under development.
        </p>
      </div>
    </main>
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

      {/* Public routes */}
      <Route
        path="/admin/login"
        element={
          <GuestRoute>
            <AdminLoginPage></AdminLoginPage>
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
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <PlaceholderPage title="Admin Dashboard" />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/employees"
        element={
          <AdminRoute>
            <PlaceholderPage title="Employees" />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/employees/:employeeId"
        element={
          <AdminRoute>
            <PlaceholderPage title="Employee Details" />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/attendance"
        element={
          <AdminRoute>
            <PlaceholderPage title="Attendance Management" />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/attendance/:employeeId"
        element={
          <AdminRoute>
            <PlaceholderPage title="Employee Attendance History" />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/attendance/reviews"
        element={
          <AdminRoute>
            <PlaceholderPage title="Attendance Reviews" />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/schedule"
        element={
          <AdminRoute>
            <PlaceholderPage title="Schedule & Holidays" />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/password-resets"
        element={
          <AdminRoute>
            <PlaceholderPage title="Password Reset Requests" />
          </AdminRoute>
        }
      />

      {/* Employee routes */}
      <Route
        path="/employee/dashboard"
        element={
          <EmployeeRoute>
            <PlaceholderPage title="Employee Dashboard" />
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
