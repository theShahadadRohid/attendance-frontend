import { useState, type FormEvent, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import axios from "axios";
import { normalizeBangladeshPhone } from "../../utils/phone";
import { adminApi } from "../../lib/api";
import {
  BiChevronLeft,
  BiChevronRight,
  BiPlus,
  BiSearch,
  BiX,
} from "react-icons/bi";
import { FiRefreshCw, FiEye, FiEyeOff } from "react-icons/fi";
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
    employee: Employee & {
      hasAccount: boolean;
    };
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
  password: string;
  confirmPassword: string;
}

const PAGE_SIZE = 20;

const fieldClassName =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#F40026] focus:ring-2 focus:ring-[#F40026]/10";

const initialForm: EmployeeForm = {
  employeeCode: "",
  fullName: "",
  designation: "",
  officialEmail: "",
  phoneNumber: "",
  employmentType: "office",
  department: "",
  password: "",
  confirmPassword: "",
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

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function EmployeeManagementPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [skip, setSkip] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EmployeeForm>(initialForm);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");

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
        phoneNumber: normalizeBangladeshPhone(input.phoneNumber),
        employmentType: input.employmentType,
        password: input.password,
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
      setFormError("");
      setShowPassword(false);
      setShowConfirmPassword(false);

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

    if (formError) {
      setFormError("");
    }

    if (createEmployeeMutation.isError) {
      createEmployeeMutation.reset();
    }
  }

  function handleCreateEmployee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (form.password.length < 8 || form.password.length > 128) {
      setFormError("Password must be between 8 and 128 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    createEmployeeMutation.mutate(form);
  }

  function changeStatusFilter(value: StatusFilter) {
    setStatusFilter(value);
    setSkip(0);
  }

  function closeForm() {
    setShowForm(false);
    setForm(initialForm);
    setFormError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    createEmployeeMutation.reset();
  }

  return (
    <div className="w-full space-y-7">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#F40026]" />
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              People Management
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#030708] sm:text-3xl">
            Employees
          </h1>

          <p className="mt-1.5 text-sm text-slate-500">
            Manage employee profiles and employment information.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm((current) => !current);
            setFormError("");
            createEmployeeMutation.reset();
          }}
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg bg-[#F40026] px-4 text-sm font-semibold text-white transition hover:bg-red-700 sm:self-auto"
        >
          {showForm ? <BiX size={18} /> : <BiPlus size={18} />}
          {showForm ? "Close Form" : "Add Employee"}
        </button>
      </div>

      {/* Create employee form */}
      {showForm && (
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="font-semibold text-[#030708]">Create Employee</h2>
            <p className="mt-1 text-sm text-slate-500">
              Create an employee profile and login account together.
            </p>
          </div>

          <form onSubmit={handleCreateEmployee} className="p-5 sm:p-6">
            {(formError || createEmployeeMutation.isError) && (
              <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <span className="font-semibold">!</span>
                <p>{formError || getApiError(createEmployeeMutation.error)}</p>
              </div>
            )}

            {/* Employee information */}
            <div>
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-[#030708]">
                  Employee Information
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Basic information and employment details.
                </p>
              </div>

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
                    inputMode="numeric"
                    maxLength={11}
                    pattern="01[3-9][0-9]{8}"
                    title="Enter an 11-digit Bangladeshi mobile number."
                    value={form.phoneNumber}
                    onChange={(event) =>
                      updateForm("phoneNumber", event.target.value)
                    }
                    placeholder="01712345678"
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
            </div>

            {/* Login credentials */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-[#030708]">
                  Login Credentials
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Set the employee's initial password. They can change it later.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField label="Password" required>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      minLength={8}
                      maxLength={128}
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(event) =>
                        updateForm("password", event.target.value)
                      }
                      placeholder="Minimum 8 characters"
                      className={`${fieldClassName} pr-11`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#030708]"
                    >
                      {showPassword ? (
                        <FiEyeOff size={17} />
                      ) : (
                        <FiEye size={17} />
                      )}
                    </button>
                  </div>
                </FormField>

                <FormField label="Confirm Password" required>
                  <div className="relative">
                    <input
                      required
                      type={showConfirmPassword ? "text" : "password"}
                      minLength={8}
                      maxLength={128}
                      autoComplete="new-password"
                      value={form.confirmPassword}
                      onChange={(event) =>
                        updateForm("confirmPassword", event.target.value)
                      }
                      placeholder="Enter password again"
                      className={`${fieldClassName} pr-11`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((current) => !current)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#030708]"
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff size={17} />
                      ) : (
                        <FiEye size={17} />
                      )}
                    </button>
                  </div>
                </FormField>
              </div>
            </div>

            {/* Form actions */}
            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeForm}
                disabled={createEmployeeMutation.isPending}
                className="h-10 rounded-lg border border-slate-200 px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={createEmployeeMutation.isPending}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#F40026] px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
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

      {/* Employee directory */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-[#030708]">Employee Directory</h2>
            <p className="mt-1 text-sm text-slate-500">
              {pagination
                ? `${pagination.total} employee profiles`
                : "Browse and manage employee profiles"}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <BiSearch
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search loaded employees..."
                aria-label="Search loaded employees"
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#F40026] focus:ring-2 focus:ring-[#F40026]/10 sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                changeStatusFilter(event.target.value as StatusFilter)
              }
              aria-label="Filter employees by status"
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#F40026] focus:ring-2 focus:ring-[#F40026]/10"
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
              className="flex h-10 items-center justify-center rounded-lg border border-slate-200 px-3 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiRefreshCw
                size={17}
                className={employeesQuery.isFetching ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {employeesQuery.isLoading ? (
          <div className="flex flex-col items-center justify-center px-4 py-16">
            <FiRefreshCw size={23} className="animate-spin text-[#F40026]" />
            <p className="mt-3 text-sm font-medium text-slate-600">
              Loading employees...
            </p>
          </div>
        ) : employeesQuery.isError ? (
          <div className="px-4 py-14 text-center">
            <p className="font-semibold text-[#030708]">
              Unable to load employees
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {getApiError(employeesQuery.error)}
            </p>
            <button
              type="button"
              onClick={() => void employeesQuery.refetch()}
              className="mt-4 rounded-lg bg-[#F40026] px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FaUsers size={21} />
            </div>
            <p className="mt-4 font-semibold text-[#030708]">
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
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#030708] text-xs font-bold text-white">
                            {getInitials(employee.fullName)}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-[#030708]">
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
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                          {employee.employmentType}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            employee.isActive
                              ? "bg-slate-100 text-slate-700"
                              : "bg-red-50 text-[#F40026]"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              employee.isActive
                                ? "bg-slate-500"
                                : "bg-[#F40026]"
                            }`}
                          />
                          {employee.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/admin/employees/${employee._id}`}
                          className="text-sm font-semibold text-[#F40026] transition hover:text-red-700"
                        >
                          View profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-[#030708]">
                  {skip + 1}–{skip + employees.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#030708]">
                  {pagination?.total ?? 0}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={skip === 0}
                  onClick={() =>
                    setSkip((current) => Math.max(0, current - PAGE_SIZE))
                  }
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <BiChevronLeft size={17} />
                  Previous
                </button>

                <button
                  type="button"
                  disabled={!pagination?.hasMore}
                  onClick={() => setSkip((current) => current + PAGE_SIZE)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <BiChevronRight size={17} />
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
        {required && <span className="ml-1 text-[#F40026]">*</span>}
      </span>
      {children}
    </label>
  );
}
