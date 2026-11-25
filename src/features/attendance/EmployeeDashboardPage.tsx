import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

import { employeeApi } from "../../lib/api";
import { useAuth } from "../auth/useAuth";

import type {
  ApiResponse,
  TodayAttendanceResponse,
} from "./types/attendance.types";

import { getErrorDetails } from "./utils/attendance-errors";
import { getCurrentLocation, type Coordinates } from "./utils/geolocation";

import { LocationSection } from "./components/LocationSection";
import { AttendanceSummary } from "./components/AttendanceSummary";
import { AttendanceActions } from "./components/AttendanceActions";

import { useAttendanceActions } from "./hooks/useAttendanceActions";

const OFFICE_LOCATION = {
  latitude: 22.359923,
  longitude: 91.82385,
};

const OFFICE_RADIUS_METERS = 50;

export default function EmployeeDashboardPage() {
  const { employee } = useAuth();

  const [checkInReason, setCheckInReason] = useState("");
  const [checkOutNote, setCheckOutNote] = useState("");
  const [showCheckInReason, setShowCheckInReason] = useState(false);
  const [showCheckOutNote, setShowCheckOutNote] = useState(false);
  const [actionError, setActionError] = useState("");

  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(
    null,
  );

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

  const { checkInMutation, checkOutMutation, isSubmitting } =
    useAttendanceActions({
      onError: setActionError,

      onCheckInReasonRequired: () => {
        setShowCheckInReason(true);
      },

      onCheckOutNoteRequired: () => {
        setShowCheckOutNote(true);
      },

      onCheckInSuccess: () => {
        setCheckInReason("");
        setShowCheckInReason(false);
      },

      onCheckOutSuccess: () => {
        setCheckOutNote("");
        setShowCheckOutNote(false);
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

  async function handleCheckIn() {
    setActionError("");

    if (showCheckInReason && !checkInReason.trim()) {
      setActionError("Please enter your late check-in reason.");
      return;
    }

    try {
      const location = currentLocation ?? (await getCurrentLocation());

      setCurrentLocation(location);

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
      const location = currentLocation ?? (await getCurrentLocation());

      setCurrentLocation(location);

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

  const attendance = todayData.attendance ?? null;
  const timeZone = todayData.timeZone ?? "Asia/Dhaka";

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

        <LocationSection
          currentLocation={currentLocation}
          officeLocation={OFFICE_LOCATION}
          officeRadiusMeters={OFFICE_RADIUS_METERS}
          onGetMyLocation={handleGetMyLocation}
          onPositionChange={setCurrentLocation}
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <AttendanceSummary
            attendance={attendance}
            date={todayData.date}
            timeZone={timeZone}
          />

          <AttendanceActions
            hasCheckedIn={hasCheckedIn}
            hasCheckedOut={hasCheckedOut}
            isSubmitting={isSubmitting}
            isCheckingIn={checkInMutation.isPending}
            isCheckingOut={checkOutMutation.isPending}
            showCheckInReason={showCheckInReason}
            showCheckOutNote={showCheckOutNote}
            checkInReason={checkInReason}
            checkOutNote={checkOutNote}
            actionError={actionError}
            onCheckInReasonChange={setCheckInReason}
            onCheckOutNoteChange={setCheckOutNote}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />
        </section>
      </div>
    </main>
  );
}
