import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FiCheckCircle,
  FiClipboard,
  FiKey,
  FiRefreshCw,
  FiShield,
  FiUser,
} from "react-icons/fi";

import { adminApi } from "../../lib/api";

interface Employee {
  _id: string;
  employeeCode: string;
  fullName: string;
  designation: string;
  officialEmail: string;
  phoneNumber: string;
}

interface PasswordResetRequest {
  _id: string;
  employeeId: Employee | null;
  status: string;
  requestedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface RequestsResponse {
  requests: PasswordResetRequest[];
  total: number;
}

function getErrorMessage(error: unknown): string {
  const axiosError = error as {
    response?: {
      data?: {
        message?: string;
        error?: {
          message?: string;
        };
      };
    };
  };

  return (
    axiosError.response?.data?.message ||
    axiosError.response?.data?.error?.message ||
    "Something went wrong. Please try again."
  );
}

function generateTemporaryPassword(): string {
  const characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$!";
  const randomValues = new Uint32Array(16);

  window.crypto.getRandomValues(randomValues);

  return Array.from(
    randomValues,
    (value) => characters[value % characters.length],
  ).join("");
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dhaka",
  }).format(new Date(value));
}

function Section({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {children}
    </section>
  );
}

export default function PasswordResetRequestsPage() {
  const queryClient = useQueryClient();

  const [selectedRequest, setSelectedRequest] =
    useState<PasswordResetRequest | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [issuedPassword, setIssuedPassword] = useState("");

  const requestsQuery = useQuery({
    queryKey: ["password-reset-requests"],
    queryFn: async () => {
      const response = await adminApi.get<ApiResponse<RequestsResponse>>(
        "/auth/employee/password-reset-requests",
      );

      return response.data.data;
    },
  });

  const resetMutation = useMutation({
    mutationFn: async ({
      requestId,
      password,
    }: {
      requestId: string;
      password: string;
    }) => {
      const response = await adminApi.post(
        `/auth/employee/password-reset-requests/${requestId}/reset`,
        { temporaryPassword: password },
      );

      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["password-reset-requests"],
      });

      setIssuedPassword(temporaryPassword);
      setSelectedRequest(null);
      setTemporaryPassword("");
      setShowPassword(false);
      setPageError("");
      setSuccessMessage(
        "Temporary password issued successfully. Share it securely with the employee.",
      );
    },
    onError: (error) => {
      setPageError(getErrorMessage(error));
      setSuccessMessage("");
    },
  });

  function openResetForm(request: PasswordResetRequest) {
    setSelectedRequest(request);
    setTemporaryPassword(generateTemporaryPassword());
    setShowPassword(false);
    setIssuedPassword("");
    setPageError("");
    setSuccessMessage("");
  }

  function closeResetForm() {
    setSelectedRequest(null);
    setTemporaryPassword("");
    setShowPassword(false);
  }

  async function copyPassword(password: string) {
    try {
      await navigator.clipboard.writeText(password);
      setSuccessMessage("Password copied to clipboard.");
    } catch {
      setPageError(
        "Could not access the clipboard. Please copy the password manually.",
      );
    }
  }

  function handleIssuePassword() {
    if (!selectedRequest || temporaryPassword.length < 8) {
      setPageError("Temporary password must be at least 8 characters.");
      return;
    }

    const confirmed = window.confirm(
      `Issue a new temporary password for ${selectedRequest.employeeId?.fullName ?? "this employee"}? Their existing sessions will be invalidated.`,
    );

    if (!confirmed) return;

    setPageError("");
    setSuccessMessage("");

    resetMutation.mutate({
      requestId: selectedRequest._id,
      password: temporaryPassword,
    });
  }

  const requests = requestsQuery.data?.requests ?? [];

  if (requestsQuery.isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
        <FiRefreshCw className="mr-2 animate-spin" />
        Loading password reset requests...
      </div>
    );
  }

  if (requestsQuery.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        <p>{getErrorMessage(requestsQuery.error)}</p>
        <button
          type="button"
          onClick={() => void requestsQuery.refetch()}
          className="mt-3 font-medium underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Password Reset Requests
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review employee requests and issue temporary passwords.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void requestsQuery.refetch()}
          disabled={requestsQuery.isFetching}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <FiRefreshCw
            className={requestsQuery.isFetching ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {(pageError || successMessage) && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            pageError
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {pageError || successMessage}
        </div>
      )}

      {issuedPassword && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-center gap-2 font-semibold text-green-800">
            <FiCheckCircle />
            Temporary password issued
          </div>
          <p className="mt-2 text-sm text-green-700">
            Copy this password and share it securely with the employee. It will
            not be shown again on this page.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <code className="rounded-lg border border-green-200 bg-white px-4 py-3 font-mono text-sm text-slate-800">
              {issuedPassword}
            </code>
            <button
              type="button"
              onClick={() => void copyPassword(issuedPassword)}
              className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-3 text-sm font-medium text-white hover:bg-green-800"
            >
              <FiClipboard />
              Copy
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIssuedPassword("")}
            className="mt-3 text-xs font-medium text-green-800 underline"
          >
            Dismiss password
          </button>
        </div>
      )}

      {selectedRequest && (
        <Section>
          <div className="border-b border-slate-100 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-800">
                  Issue Temporary Password
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedRequest.employeeId?.fullName ?? "Employee account"}
                </p>
              </div>
              <FiKey className="text-xl text-blue-600" />
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Temporary Password
              </label>
              <div className="flex flex-wrap gap-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={temporaryPassword}
                  onChange={(event) => setTemporaryPassword(event.target.value)}
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setTemporaryPassword(generateTemporaryPassword())
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Generate
                </button>

                <button
                  type="button"
                  onClick={() => void copyPassword(temporaryPassword)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50"
                  title="Copy password"
                >
                  <FiClipboard />
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                At least 8 characters. The employee must change this password
                after logging in.
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={closeResetForm}
                disabled={resetMutation.isPending}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleIssuePassword}
                disabled={
                  resetMutation.isPending || temporaryPassword.length < 8
                }
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiKey />
                {resetMutation.isPending
                  ? "Issuing..."
                  : "Issue Temporary Password"}
              </button>
            </div>
          </div>
        </Section>
      )}

      <Section>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
          <div>
            <h2 className="font-semibold text-slate-800">Pending Requests</h2>
            <p className="mt-1 text-sm text-slate-500">
              Employees waiting for password assistance.
            </p>
          </div>

          <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
            {requests.length} pending
          </span>
        </div>

        {requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3 font-semibold">Employee</th>
                  <th className="px-5 py-3 font-semibold">Contact</th>
                  <th className="px-5 py-3 font-semibold">Requested At</th>
                  <th className="px-5 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => {
                  const employee = request.employeeId;

                  return (
                    <tr
                      key={request._id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <FiUser />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {employee?.fullName ?? "Employee unavailable"}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {employee?.employeeCode ?? "—"}
                              {employee?.designation
                                ? ` · ${employee.designation}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        <p>{employee?.phoneNumber ?? "—"}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {employee?.officialEmail ?? "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                        {formatDate(request.requestedAt)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          disabled={!employee || resetMutation.isPending}
                          onClick={() => openResetForm(request)}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FiKey />
                          Issue Password
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-14 text-center">
            <FiShield className="mx-auto mb-3 text-3xl text-slate-300" />
            <p className="font-medium text-slate-700">
              No pending password reset requests
            </p>
            <p className="mt-1 text-sm text-slate-500">
              New employee requests will appear here.
            </p>
          </div>
        )}
      </Section>
    </div>
  );
}
