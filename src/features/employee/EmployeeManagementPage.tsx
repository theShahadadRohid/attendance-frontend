import { useState, type FormEvent, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import axios from "axios";

import { adminApi } from "../../lib/api";
import {
  BiChevronLeft,
  BiChevronRight,
  BiPlus,
  BiSearch,
  BiX,
} from "react-icons/bi";
import { FiRefreshCw } from "react-icons/fi";
import { FaUsers } from "react-icons/fa";

type EmploymentType = "office" | "remote";
type StatusFilter = "active" | "inactive" | "all";

interface Employee {
  _id: string;
  employeeCode: string;
  fullName: string;
  designation: string;
  officialEmail: string;
  phoneNumber: string;
  employmentType: EmploymentType;
  department?: string;
  isActive: boolean;
  createdAt: string;
}

interface EmployeeListResponse {
  message: string;
  data: {
    employees: Employee[];
    pagination: {
      total: number;
      limit: number;
      skip: number;
      hasMore: boolean;
    };
  };
}

interface CreateEmployeeResponse {
  message: string;
  data: {
    employee: Employee;
  };
}

interface EmployeeForm {
  employeeCode: string;
  fullName: string;
  designation: string;
  officialEmail: string;
  phoneNumber: string;
  employmentType: EmploymentType;
  department: string;
}

const PAGE_SIZE = 20;

const fieldClassName =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400";

const initialForm: EmployeeForm = {
  employeeCode: "",
  fullName: "",
  designation: "",
  officialEmail: "",
  phoneNumber: "",
  employmentType: "office",
  department: "",
};

function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Something went wrong. Please try again."
    );
  }

  return "Something went wrong. Please try again.";
}

export default function EmployeeManagementPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [skip, setSkip] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EmployeeForm>(initialForm);

  const employeesQuery = useQuery({
    queryKey: ["admin-employees", statusFilter, skip],
    queryFn: async () => {
      const response = await adminApi.get<EmployeeListResponse>("/employees", {
        params: {
          includeInactive: statusFilter !== "active",
          limit: PAGE_SIZE,
          skip,
        },
      });

      return response.data.data;
    },
  });

  const createEmployeeMutation = useMutation({
    mutationFn: async (input: EmployeeForm) => {
      const payload = {
        employeeCode: input.employeeCode.trim().toUpperCase(),
        fullName: input.fullName.trim(),
        designation: input.designation.trim(),
        officialEmail: input.officialEmail.trim(),
        phoneNumber: input.phoneNumber.trim(),
        employmentType: input.employmentType,
        ...(input.department.trim()
          ? { department: input.department.trim() }
          : {}),
      };

      const response = await adminApi.post<CreateEmployeeResponse>(
        "/employees",
        payload,
      );

      return response.data.data.employee;
    },
    onSuccess: async () => {
      setForm(initialForm);
      setShowForm(false);
      setSearch("");
      setStatusFilter("active");
      setSkip(0);

      await queryClient.invalidateQueries({
        queryKey: ["admin-employees"],
      });
    },
  });

  const employees = employeesQuery.data?.employees ?? [];
  const pagination = employeesQuery.data?.pagination;

  const filteredEmployees = employees.filter((employee) => {
    if (statusFilter === "active" && !employee.isActive) return false;
    if (statusFilter === "inactive" && employee.isActive) return false;

    const searchValue = search.trim().toLowerCase();

    if (!searchValue) return true;

    return [
      employee.fullName,
      employee.employeeCode,
      employee.designation,
      employee.officialEmail,
      employee.phoneNumber,
      employee.department ?? "",
    ].some((value) => value.toLowerCase().includes(searchValue));
  });

  function updateForm<K extends keyof EmployeeForm>(
    key: K,
    value: EmployeeForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleCreateEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createEmployeeMutation.mutate(form);
  }

  function changeStatusFilter(value: StatusFilter) {
    setStatusFilter(value);
    setSkip(0);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage employee profiles and employment information.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm((current) => !current);
            createEmployeeMutation.reset();
          }}
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          {showForm ? <BiX size={17} /> : <BiPlus size={17} />}
          {showForm ? "Close Form" : "Add Employee"}
        </button>
      </div>

      {/* Create employee form */}
      {showForm && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Create Employee Profile
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              This creates an employee profile. Login credentials are created
              separately.
            </p>
          </div>

          {createEmployeeMutation.isError && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {getApiError(createEmployeeMutation.error)}
            </div>
          )}

          <form onSubmit={handleCreateEmployee}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <FormField label="Employee Code" required>
                <input
                  required
                  minLength={2}
                  maxLength={30}
                  value={form.employeeCode}
                  onChange={(event) =>
                    updateForm("employeeCode", event.target.value)
                  }
                  placeholder="EMP002"
                  className={fieldClassName}
                />
              </FormField>

              <FormField label="Full Name" required>
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={form.fullName}
                  onChange={(event) =>
                    updateForm("fullName", event.target.value)
                  }
                  placeholder="Employee full name"
                  className={fieldClassName}
                />
              </FormField>

              <FormField label="Designation" required>
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  value={form.designation}
                  onChange={(event) =>
                    updateForm("designation", event.target.value)
                  }
                  placeholder="Software Engineer"
                  className={fieldClassName}
                />
              </FormField>

              <FormField label="Official Email" required>
                <input
                  required
                  type="email"
                  maxLength={254}
                  value={form.officialEmail}
                  onChange={(event) =>
                    updateForm("officialEmail", event.target.value)
                  }
                  placeholder="employee@company.com"
                  className={fieldClassName}
                />
              </FormField>

              <FormField label="Phone Number" required>
                <input
                  required
                  type="tel"
                  pattern="^\+[1-9][0-9]{7,14}$"
                  title="Use international format, e.g. +8801XXXXXXXXX"
                  value={form.phoneNumber}
                  onChange={(event) =>
                    updateForm("phoneNumber", event.target.value)
                  }
                  placeholder="+8801XXXXXXXXX"
                  className={fieldClassName}
                />
              </FormField>

              <FormField label="Department">
                <input
                  minLength={2}
                  maxLength={80}
                  value={form.department}
                  onChange={(event) =>
                    updateForm("department", event.target.value)
                  }
                  placeholder="Engineering"
                  className={fieldClassName}
                />
              </FormField>

              <FormField label="Employment Type" required>
                <select
                  required
                  value={form.employmentType}
                  onChange={(event) =>
                    updateForm(
                      "employmentType",
                      event.target.value as EmploymentType,
                    )
                  }
                  className={fieldClassName}
                >
                  <option value="office">Office</option>
                  <option value="remote">Remote</option>
                </select>
              </FormField>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(initialForm);
                  createEmployeeMutation.reset();
                }}
                className="h-10 rounded-xl border border-slate-200 px-5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={createEmployeeMutation.isPending}
                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createEmployeeMutation.isPending && (
                  <FiRefreshCw size={16} className="animate-spin" />
                )}
                {createEmployeeMutation.isPending
                  ? "Creating..."
                  : "Create Employee"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Employee list */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Employee Directory</h2>
            <p className="mt-1 text-sm text-slate-500">
              {pagination
                ? `${pagination.total} employee profiles`
                : "Browse employee profiles"}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <BiSearch
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search loaded employees..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-indigo-400 sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                changeStatusFilter(event.target.value as StatusFilter)
              }
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-400"
            >
              <option value="active">Active employees</option>
              <option value="inactive">Inactive employees</option>
              <option value="all">All employees</option>
            </select>

            <button
              type="button"
              onClick={() => void employeesQuery.refetch()}
              disabled={employeesQuery.isFetching}
              aria-label="Refresh employees"
              className="flex h-10 items-center justify-center rounded-xl border border-slate-200 px-3 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <FiRefreshCw
                size={17}
                className={employeesQuery.isFetching ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {employeesQuery.isLoading ? (
          <div className="p-12 text-center">
            <FiRefreshCw
              size={22}
              className="mx-auto animate-spin text-indigo-600"
            />
            <p className="mt-3 text-sm text-slate-500">Loading employees...</p>
          </div>
        ) : employeesQuery.isError ? (
          <div className="p-10 text-center">
            <p className="font-semibold text-red-700">
              Unable to load employees
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {getApiError(employeesQuery.error)}
            </p>
            <button
              type="button"
              onClick={() => void employeesQuery.refetch()}
              className="mt-4 text-sm font-semibold text-indigo-600 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-12 text-center">
            <FaUsers size={30} className="mx-auto text-slate-300" />
            <p className="mt-3 font-semibold text-slate-800">
              No employees found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try another search or change the status filter.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-slate-50">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4">Employee</th>
                    <th className="px-5 py-4">Contact</th>
                    <th className="px-5 py-4">Department</th>
                    <th className="px-5 py-4">Employment</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map((employee) => (
                    <tr
                      key={employee._id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700">
                            {employee.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {employee.fullName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {employee.employeeCode} · {employee.designation}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-700">
                          {employee.officialEmail}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {employee.phoneNumber}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {employee.department || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                          {employee.employmentType}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            employee.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {employee.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/admin/employees/${employee._id}`}
                          className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          View profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing {skip + 1}–{skip + employees.length} of{" "}
                {pagination?.total ?? 0}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={skip === 0}
                  onClick={() =>
                    setSkip((current) => Math.max(0, current - PAGE_SIZE))
                  }
                  className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <BiChevronLeft size={16} />
                  Previous
                </button>

                <button
                  type="button"
                  disabled={!pagination?.hasMore}
                  onClick={() => setSkip((current) => current + PAGE_SIZE)}
                  className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <BiChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
