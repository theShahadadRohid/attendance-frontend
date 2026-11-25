import { useState, type FormEvent, type ComponentType } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiMail,
  FiPhone,
  FiUser,
  FiEdit2,
  FiSave,
  FiX,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import axios from "axios";
import {
  normalizeBangladeshPhone,
  toLocalPhoneNumber,
} from "../../utils/phone";
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
  hasAccount: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EmployeeResponse {
  message: string;
  data: {
    employee: Employee;
  };
}

interface UpdateEmployeeInput {
  fullName: string;
  designation: string;
  officialEmail: string;
  phoneNumber: string;
  employmentType: "office" | "remote";
  department?: string;
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Something went wrong."
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

const inputClassName =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#F40026] focus:ring-2 focus:ring-[#F40026]/10";

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ size?: number }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
        <Icon size={15} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-0.5 break-words text-sm font-semibold text-[#030708]">
          {value}
        </p>
      </div>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function EmployeeDetailsPage() {
  const { employeeId } = useParams<{ employeeId: string }>();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UpdateEmployeeInput | null>(null);
  const [updateError, setUpdateError] = useState("");

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

  const updateMutation = useMutation({
    mutationFn: async (input: UpdateEmployeeInput) => {
      const response = await adminApi.patch<EmployeeResponse>(
        `/employees/${employeeId}`,
        input,
      );

      return response.data.data.employee;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin-employee", employeeId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["admin-employees"],
      });

      setIsEditing(false);
      setForm(null);
      setUpdateError("");
    },
    onError: (error: unknown) => {
      setUpdateError(getErrorMessage(error));
    },
  });

  function startEditing() {
    if (!employee) return;

    setForm({
      fullName: employee.fullName,
      designation: employee.designation,
      officialEmail: employee.officialEmail,
      phoneNumber: toLocalPhoneNumber(employee.phoneNumber),
      employmentType: employee.employmentType,
      department: employee.department || "",
    });

    setUpdateError("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setForm(null);
    setUpdateError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form) return;

    const payload: UpdateEmployeeInput = {
      fullName: form.fullName.trim(),
      designation: form.designation.trim(),
      officialEmail: form.officialEmail.trim(),
      phoneNumber: normalizeBangladeshPhone(form.phoneNumber),
      employmentType: form.employmentType,
      ...(form.department?.trim()
        ? { department: form.department.trim() }
        : {}),
    };

    updateMutation.mutate(payload);
  }

  function updateField<K extends keyof UpdateEmployeeInput>(
    field: K,
    value: UpdateEmployeeInput[K],
  ) {
    setForm((current) => (current ? { ...current, [field]: value } : current));

    if (updateError) {
      setUpdateError("");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-6">
        <FiRefreshCw size={22} className="animate-spin text-[#F40026]" />
        <p className="mt-2 text-sm font-medium text-slate-600">
          Loading employee details...
        </p>
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#F40026]">
            <FiAlertCircle size={19} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[#030708]">
              Unable to load employee
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {getErrorMessage(error)}
            </p>

            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#F40026] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              <FiRefreshCw size={14} />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Compact page heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link
            to="/admin/employees"
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-[#F40026]"
          >
            <FiArrowLeft size={14} />
            Back to employees
          </Link>

          <h1 className="text-xl font-bold tracking-tight text-[#030708]">
            Employee Details
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to={`/admin/attendance/${employee._id}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:text-sm"
          >
            <FiCalendar size={15} />
            Attendance History
          </Link>

          {!isEditing && (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F40026] px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 sm:text-sm"
            >
              <FiEdit2 size={15} />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Compact employee profile */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#030708] text-base font-bold text-white">
            {getInitials(employee.fullName)}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="break-words text-base font-bold text-[#030708]">
              {employee.fullName}
            </h2>

            <p className="mt-0.5 text-sm text-slate-500">
              {employee.designation}
            </p>

            <p className="mt-0.5 text-xs font-semibold tracking-wide text-slate-400">
              {employee.employeeCode}
            </p>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              employee.isActive
                ? "bg-slate-100 text-slate-700"
                : "bg-red-50 text-[#F40026]"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                employee.isActive ? "bg-slate-500" : "bg-[#F40026]"
              }`}
            />
            {employee.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </section>

      {/* Compact edit form */}
      {isEditing && form ? (
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-[#030708]">
                Edit Employee Information
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Update the employee profile details.
              </p>
            </div>
          </div>

          <div className="p-4">
            {updateError && (
              <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <FiAlertCircle className="mt-0.5 shrink-0" size={15} />
                <p>{updateError}</p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <FormField label="Full Name">
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  className={inputClassName}
                  value={form.fullName}
                  onChange={(event) =>
                    updateField("fullName", event.target.value)
                  }
                />
              </FormField>

              <FormField label="Designation">
                <input
                  required
                  minLength={2}
                  maxLength={100}
                  className={inputClassName}
                  value={form.designation}
                  onChange={(event) =>
                    updateField("designation", event.target.value)
                  }
                />
              </FormField>

              <FormField label="Official Email">
                <input
                  required
                  type="email"
                  maxLength={254}
                  className={inputClassName}
                  value={form.officialEmail}
                  onChange={(event) =>
                    updateField("officialEmail", event.target.value)
                  }
                />
              </FormField>

              <FormField label="Phone Number">
                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  pattern="01[3-9][0-9]{8}"
                  title="Enter an 11-digit Bangladeshi mobile number."
                  placeholder="01712345678"
                  className={inputClassName}
                  value={form.phoneNumber}
                  onChange={(event) =>
                    updateField("phoneNumber", event.target.value)
                  }
                />
              </FormField>

              <FormField label="Department">
                <input
                  maxLength={80}
                  minLength={2}
                  className={inputClassName}
                  value={form.department || ""}
                  onChange={(event) =>
                    updateField("department", event.target.value)
                  }
                />
              </FormField>

              <FormField label="Employment Type">
                <select
                  className={inputClassName}
                  value={form.employmentType}
                  onChange={(event) =>
                    updateField(
                      "employmentType",
                      event.target.value as "office" | "remote",
                    )
                  }
                >
                  <option value="office">Office</option>
                  <option value="remote">Remote</option>
                </select>
              </FormField>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-4 py-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={cancelEditing}
              disabled={updateMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <FiX size={15} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F40026] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateMutation.isPending ? (
                <FiRefreshCw className="animate-spin" size={15} />
              ) : (
                <FiSave size={15} />
              )}
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        /* All employee information in one compact card */
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-[#030708]">
                Employee Information
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Contact, employment and account details
              </p>
            </div>
          </div>

          <div className="grid gap-x-5 gap-y-5 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <DetailItem
              icon={FiMail}
              label="Official Email"
              value={employee.officialEmail}
            />

            <DetailItem
              icon={FiPhone}
              label="Phone Number"
              value={toLocalPhoneNumber(employee.phoneNumber)}
            />

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

            <div className="flex min-w-0 items-start gap-2.5">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                  employee.hasAccount
                    ? "bg-slate-100 text-slate-700"
                    : "bg-red-50 text-[#F40026]"
                }`}
              >
                {employee.hasAccount ? (
                  <FiCheckCircle size={15} />
                ) : (
                  <FiAlertCircle size={15} />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500">
                  Login Account
                </p>
                <p
                  className={`mt-0.5 text-sm font-semibold ${
                    employee.hasAccount ? "text-[#030708]" : "text-[#F40026]"
                  }`}
                >
                  {employee.hasAccount ? "Account created" : "No account"}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {employee.hasAccount
                    ? "Can log in with registered phone."
                    : "Login account has not been created."}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </span>
      {children}
    </label>
  );
}
