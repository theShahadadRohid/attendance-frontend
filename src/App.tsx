import { Navigate, Route, Routes } from "react-router-dom";

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

function App() {
  return (
    <Routes>
      {/* Default */}
      <Route path="/" element={<Navigate to="/admin/login" replace />} />

      {/* Admin */}
      <Route
        path="/admin/login"
        element={<PlaceholderPage title="Admin Login" />}
      />
      <Route
        path="/admin/dashboard"
        element={<PlaceholderPage title="Admin Dashboard" />}
      />
      <Route
        path="/admin/employees"
        element={<PlaceholderPage title="Employees" />}
      />
      <Route
        path="/admin/employees/:employeeId"
        element={<PlaceholderPage title="Employee Details" />}
      />
      <Route
        path="/admin/attendance"
        element={<PlaceholderPage title="Attendance Management" />}
      />
      <Route
        path="/admin/attendance/:employeeId"
        element={<PlaceholderPage title="Employee Attendance History" />}
      />
      <Route
        path="/admin/attendance/reviews"
        element={<PlaceholderPage title="Attendance Reviews" />}
      />
      <Route
        path="/admin/schedule"
        element={<PlaceholderPage title="Schedule & Holidays" />}
      />
      <Route
        path="/admin/password-resets"
        element={<PlaceholderPage title="Password Reset Requests" />}
      />

      {/* Employee */}
      <Route
        path="/employee/login"
        element={<PlaceholderPage title="Employee Login" />}
      />
      <Route
        path="/employee/dashboard"
        element={<PlaceholderPage title="Employee Dashboard" />}
      />
      <Route
        path="/employee/attendance"
        element={<PlaceholderPage title="My Attendance History" />}
      />
      <Route
        path="/employee/settings"
        element={<PlaceholderPage title="Account Settings" />}
      />

      {/* Not found */}
      <Route
        path="*"
        element={<PlaceholderPage title="404 - Page Not Found" />}
      />
    </Routes>
  );
}

export default App;
