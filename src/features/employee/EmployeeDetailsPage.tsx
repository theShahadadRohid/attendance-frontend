import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiMail,
  FiPhone,
  FiUser,
} from "react-icons/fi";
import axios from "axios";

import { adminApi } from "../../lib/api";

interface Employee {
  _id: string;
  employeeCode: string;
  fullName: string;
  designation: string;
  officialEmail: string;
  phoneNumber: string;
  employmentType: "office" | "remote";
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EmployeeResponse {
  message: string;
  data: {
    employee: Employee;
  };
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to load employee details."
    );
  }

  return "Something went wrong.";
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-slate-100 p-2.5 text-slate-500">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function EmployeeDetailsPage() {
  const { employeeId } = useParams<{ employeeId: string }>();

  const {
    data: employee,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-employee", employeeId],
    queryFn: async () => {
      const response = await adminApi.get<EmployeeResponse>(
        `/employees/${employeeId}`,
      );

      return response.data.data.employee;
    },
    enabled: Boolean(employeeId),
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Loading employee details...
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">
          Unable to load employee
        </h2>
        <p className="mt-2 text-sm text-red-600">{getErrorMessage(error)}</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/employees"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600"
        >
          <FiArrowLeft size={16} />
          Back to employees
        </Link>

        <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Employee Details
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View employee profile and employment information.
            </p>
          </div>

          <Link
            to={`/admin/attendance/${employee._id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <FiCalendar size={17} />
            Attendance History
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <FiUser size={30} />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-slate-900">
              {employee.fullName}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {employee.designation}
            </p>
            <p className="mt-1 text-xs font-semibold tracking-wide text-slate-400">
              {employee.employeeCode}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
              employee.isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {employee.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">
          Contact Information
        </h3>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <DetailItem
            icon={FiMail}
            label="Official Email"
            value={employee.officialEmail}
          />
          <DetailItem
            icon={FiPhone}
            label="Phone Number"
            value={employee.phoneNumber}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-900">
          Employment Information
        </h3>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <DetailItem
            icon={FiUser}
            label="Employee Code"
            value={employee.employeeCode}
          />
          <DetailItem
            icon={FiUser}
            label="Designation"
            value={employee.designation}
          />
          <DetailItem
            icon={FiUser}
            label="Department"
            value={employee.department || "Not assigned"}
          />
          <DetailItem
            icon={FiClock}
            label="Employment Type"
            value={employee.employmentType === "office" ? "Office" : "Remote"}
          />
          <DetailItem
            icon={FiCalendar}
            label="Created On"
            value={formatDate(employee.createdAt)}
          />
        </div>
      </section>
    </div>
  );
}
