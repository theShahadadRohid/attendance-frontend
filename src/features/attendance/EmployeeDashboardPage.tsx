import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiLogIn,
  FiLogOut,
  FiMapPin,
  FiRefreshCw,
} from "react-icons/fi";
import { employeeApi } from "../../lib/api";
import { useAuth } from "../auth/useAuth";

interface AttendanceRecord {
  _id: string;
  date: string;
  timeZone: string;
  status: "present" | "late" | "absent";
  checkInAt?: string;
  checkInStatus?: "on_time" | "late_yellow" | "late_red";
  checkInReason?: string;
  checkOutAt?: string;
  checkOutStatus?: "early" | "normal";
  checkOutNote?: string;
  isAutoCheckout: boolean;
  needsReview: boolean;
  reviewReason?: string;
}

interface TodayAttendanceResponse {
  date: string;
  timeZone: string;
  attendance: AttendanceRecord | null;
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

interface AttendanceActionInput {
  location: {
    latitude: number;
    longitude: number;
  };
  reason?: string;
  note?: string;
}

function getErrorDetails(error: unknown) {
  const response = (
    error as {
      response?: {
        data?: {
          message?: string;
          code?: string;
          error?: {
            message?: string;
            code?: string;
          };
        };
      };
    }
  )?.response?.data;

  return {
    message:
      response?.message ??
      response?.error?.message ??
      "Something went wrong. Please try again.",
    code: response?.code ?? response?.error?.code,
  };
}

function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Your browser does not support location access."));
      return;
    }

    console.log("GPS:");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Browser GPS:", {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toLocaleString(),
        });

        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(
            new Error(
              "Location permission denied. Please allow location access in your browser settings.",
            ),
          );
        } else if (error.code === error.TIMEOUT) {
          reject(new Error("Could not get your location. Please try again."));
        } else {
          reject(new Error("Unable to access your current location."));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  });
}

function formatTime(value: string | undefined, timeZone: string) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-BD", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  }).format(new Date(value));
}

function formatDate(value: string, timeZone: string) {
  const date = new Date(`${value}T12:00:00`);

  return new Intl.DateTimeFormat("en-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(date);
}

function getCheckInLabel(status?: AttendanceRecord["checkInStatus"]) {
  switch (status) {
    case "on_time":
      return "On time";
    case "late_yellow":
      return "Late";
    case "late_red":
      return "Late";
    default:
      return "Not checked in";
  }
}

function StatusBadge({ attendance }: { attendance: AttendanceRecord | null }) {
  if (!attendance?.checkInAt) {
    return (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        Not checked in
      </span>
    );
  }

  if (attendance.checkOutAt) {
    return (
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        Completed
      </span>
    );
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        attendance.status === "late"
          ? "bg-amber-50 text-amber-700"
          : "bg-emerald-50 text-emerald-700"
      }`}
    >
      {attendance.status === "late" ? "Checked in late" : "Present"}
    </span>
  );
}

export default function EmployeeDashboardPage() {
  const queryClient = useQueryClient();
  const { employee } = useAuth();

  const [checkInReason, setCheckInReason] = useState("");
  const [checkOutNote, setCheckOutNote] = useState("");
  const [showCheckInReason, setShowCheckInReason] = useState(false);
  const [showCheckOutNote, setShowCheckOutNote] = useState(false);
  const [actionError, setActionError] = useState("");

  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const {
    data: todayData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["employee-today-attendance"],
    queryFn: async () => {
      const response = await employeeApi.get<
        ApiResponse<TodayAttendanceResponse>
      >("/employee/attendance/today");

      return response.data.data;
    },
  });

  const handleGetMyLocation = async () => {
    try {
      setActionError("");

      const location = await getCurrentLocation();
      setCurrentLocation(location);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to get your location.",
      );
    }
  };

  const attendance = todayData?.attendance ?? null;
  const timeZone = todayData?.timeZone ?? "Asia/Dhaka";

  const checkInMutation = useMutation({
    mutationFn: async (input: AttendanceActionInput) => {
      const response = await employeeApi.post(
        "/employee/attendance/check-in",
        input,
      );

      return response.data;
    },
    onSuccess: async () => {
      setActionError("");
      setCheckInReason("");
      setShowCheckInReason(false);
      await queryClient.invalidateQueries({
        queryKey: ["employee-today-attendance"],
      });
    },
    onError: (error: unknown) => {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: unknown;
        };
      };

      console.error("Check-in API error:", {
        status: axiosError.response?.status,
        response: axiosError.response?.data,
        error,
      });

      const details = getErrorDetails(error);

      if (details.code === "LATE_REASON_REQUIRED") {
        setShowCheckInReason(true);
        setActionError("Please provide a reason for your late check-in.");
        return;
      }

      setActionError(details.message);
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async (input: AttendanceActionInput) => {
      const response = await employeeApi.post(
        "/employee/attendance/check-out",
        input,
      );

      return response.data;
    },
    onSuccess: async () => {
      setActionError("");
      setCheckOutNote("");
      setShowCheckOutNote(false);
      await queryClient.invalidateQueries({
        queryKey: ["employee-today-attendance"],
      });
    },
    onError: (error: unknown) => {
      const details = getErrorDetails(error);

      if (details.code === "CHECKOUT_NOTE_REQUIRED") {
        setShowCheckOutNote(true);
        setActionError("Please provide a note for your late checkout.");
        return;
      }

      setActionError(details.message);
    },
  });

  const isSubmitting = checkInMutation.isPending || checkOutMutation.isPending;

  async function handleCheckIn() {
    setActionError("");

    if (showCheckInReason && !checkInReason.trim()) {
      setActionError("Please enter your late check-in reason.");
      return;
    }

    try {
      const location = await getCurrentLocation();

      checkInMutation.mutate({
        location,
        ...(checkInReason.trim() && {
          reason: checkInReason.trim(),
        }),
      });
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to get your location.",
      );
    }
  }

  async function handleCheckOut() {
    setActionError("");

    if (showCheckOutNote && !checkOutNote.trim()) {
      setActionError("Please enter your checkout note.");
      return;
    }

    try {
      const location = await getCurrentLocation();

      checkOutMutation.mutate({
        location,
        ...(checkOutNote.trim() && {
          note: checkOutNote.trim(),
        }),
      });
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to get your location.",
      );
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading your attendance...</p>
      </main>
    );
  }

  if (isError || !todayData) {
    const errorMessage = getErrorDetails(error).message;

    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-100 bg-white p-8 text-center">
          <FiAlertCircle className="mx-auto text-3xl text-red-500" />
          <h1 className="mt-4 text-lg font-bold text-slate-900">
            Unable to load attendance
          </h1>
          <p className="mt-2 text-sm text-slate-500">{errorMessage}</p>
          <button
            onClick={() => refetch()}
            className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const hasCheckedIn = Boolean(attendance?.checkInAt);
  const hasCheckedOut = Boolean(attendance?.checkOutAt);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Employee Portal
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Welcome, {employee?.fullName ?? "Employee"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Here's your attendance overview for today.
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <FiRefreshCw className={isFetching ? "animate-spin" : ""} />
            Refresh
          </button>
        </header>

        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGetMyLocation}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <FiMapPin />
            Get My Location
          </button>

          {currentLocation && (
            <>
              <p className="text-sm text-gray-600">
                Latitude: {currentLocation.latitude.toFixed(6)}
                <br />
                Longitude: {currentLocation.longitude.toFixed(6)}
              </p>

              <iframe
                title="Your Current Location"
                width="100%"
                height="350"
                loading="lazy"
                className="rounded-xl border"
                src={`https://maps.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}&z=18&output=embed`}
                allowFullScreen
              />
            </>
          )}
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <FiCalendar />
                Today's Attendance
              </div>
              <h2 className="mt-2 text-lg font-bold text-slate-900">
                {formatDate(todayData.date, timeZone)}
              </h2>
            </div>

            <StatusBadge attendance={attendance} />
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <FiLogIn />
                Check-in
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {formatTime(attendance?.checkInAt, timeZone)}
              </p>
              {attendance?.checkInAt && (
                <p className="mt-2 text-xs font-medium text-slate-500">
                  {getCheckInLabel(attendance.checkInStatus)}
                </p>
              )}
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                <FiLogOut />
                Check-out
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {formatTime(attendance?.checkOutAt, timeZone)}
              </p>
              {attendance?.checkOutAt && (
                <p className="mt-2 text-xs font-medium text-slate-500">
                  {attendance.isAutoCheckout
                    ? "Automatically checked out"
                    : attendance.checkOutStatus === "early"
                      ? "Early checkout"
                      : "Normal checkout"}
                </p>
              )}
            </div>
          </div>

          {attendance?.checkInReason && (
            <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              <strong>Check-in reason:</strong> {attendance.checkInReason}
            </div>
          )}

          {attendance?.checkOutNote && (
            <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
              <strong>Checkout note:</strong> {attendance.checkOutNote}
            </div>
          )}

          {attendance?.needsReview && (
            <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <FiAlertCircle className="mt-0.5 shrink-0" />
              <div>
                <strong>Attendance needs review</strong>
                <p className="mt-1">
                  {attendance.reviewReason ??
                    "Your attendance record is awaiting admin review."}
                </p>
              </div>
            </div>
          )}

          {attendance?.isAutoCheckout && (
            <div className="mt-4 flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <FiClock className="mt-0.5 shrink-0" />
              Your checkout was recorded automatically.
            </div>
          )}

          <div className="mt-7 border-t border-slate-100 pt-6">
            {!hasCheckedIn && (
              <div>
                {showCheckInReason && (
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Reason for late check-in
                    </label>
                    <textarea
                      value={checkInReason}
                      onChange={(event) => setCheckInReason(event.target.value)}
                      rows={3}
                      maxLength={500}
                      placeholder="Explain why you are checking in late..."
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                    />
                  </div>
                )}

                <button
                  onClick={handleCheckIn}
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  <FiLogIn />
                  {checkInMutation.isPending ? "Checking in..." : "Check in"}
                </button>
              </div>
            )}

            {hasCheckedIn && !hasCheckedOut && (
              <div>
                {showCheckOutNote && (
                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Reason for late checkout
                    </label>
                    <textarea
                      value={checkOutNote}
                      onChange={(event) => setCheckOutNote(event.target.value)}
                      rows={3}
                      maxLength={500}
                      placeholder="Explain your late checkout..."
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                    />
                  </div>
                )}

                <button
                  onClick={handleCheckOut}
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  <FiLogOut />
                  {checkOutMutation.isPending ? "Checking out..." : "Check out"}
                </button>
              </div>
            )}

            {hasCheckedOut && (
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <FiCheckCircle />
                Your attendance for today is complete.
              </div>
            )}
          </div>

          {actionError && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              <FiAlertCircle className="mt-0.5 shrink-0" />
              <p>{actionError}</p>
            </div>
          )}

          <div className="mt-6 flex items-start gap-2 border-t border-slate-100 pt-5 text-xs leading-5 text-slate-500">
            <FiMapPin className="mt-0.5 shrink-0" />
            <p>
              Your browser location is required for check-in and check-out.
              Attendance is accepted only when the submitted coordinates are
              within the configured office radius.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
