import { useState, type FormEvent } from "react";
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
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-indigo-400";

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
  }

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
              View and manage employee profile information.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to={`/admin/attendance/${employee._id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <FiCalendar size={17} />
              Attendance History
            </Link>

            {!isEditing && (
              <button
                type="button"
                onClick={startEditing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <FiEdit2 size={16} />
                Edit Profile
              </button>
            )}
          </div>
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
        <div>
          <h3 className="text-base font-bold text-slate-900">Login Account</h3>

          <p className="mt-1 text-sm text-slate-500">
            Login account status for this employee.
          </p>
        </div>

        {employee.hasAccount ? (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
              <FiUser size={20} />
            </div>

            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Login account created
              </p>

              <p className="mt-1 text-sm text-emerald-700">
                This employee has a login account and can use their registered
                phone number to log in.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
              <FiUser size={20} />
            </div>

            <div>
              <p className="text-sm font-semibold text-amber-800">
                No login account
              </p>

              <p className="mt-1 text-sm text-amber-700">
                This employee does not have a login account. Login credentials
                are now created when adding a new employee.
              </p>
            </div>
          </div>
        )}
      </section>

      {isEditing && form ? (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Edit Employee Information
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Update the employee's profile details.
            </p>
          </div>

          {updateError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {updateError}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Full Name
              </span>

              <input
                required
                minLength={2}
                maxLength={100}
                className={inputClassName}
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Designation
              </span>

              <input
                required
                minLength={2}
                maxLength={100}
                className={inputClassName}
                value={form.designation}
                onChange={(e) => updateField("designation", e.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Official Email
              </span>

              <input
                required
                type="email"
                maxLength={254}
                className={inputClassName}
                value={form.officialEmail}
                onChange={(e) => updateField("officialEmail", e.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Phone Number
              </span>

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
                onChange={(e) => updateField("phoneNumber", e.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Department
              </span>

              <input
                maxLength={80}
                minLength={2}
                className={inputClassName}
                value={form.department || ""}
                onChange={(e) => updateField("department", e.target.value)}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Employment Type
              </span>

              <select
                className={inputClassName}
                value={form.employmentType}
                onChange={(e) =>
                  updateField(
                    "employmentType",
                    e.target.value as "office" | "remote",
                  )
                }
              >
                <option value="office">Office</option>
                <option value="remote">Remote</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={cancelEditing}
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <FiX size={16} />
              Cancel
            </button>

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiSave size={16} />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <>
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
                value={toLocalPhoneNumber(employee.phoneNumber)}
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
                value={
                  employee.employmentType === "office" ? "Office" : "Remote"
                }
              />

              <DetailItem
                icon={FiCalendar}
                label="Created On"
                value={formatDate(employee.createdAt)}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
