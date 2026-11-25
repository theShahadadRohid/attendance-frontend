import { useState } from "react";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

import { useAuth } from "../auth/useAuth";

import { getErrorDetails } from "./utils/attendance-errors";
import { getCurrentLocation, type Coordinates } from "./utils/geolocation";

import { LocationSection } from "./components/LocationSection";
import { AttendanceSummary } from "./components/AttendanceSummary";
import { AttendanceActions } from "./components/AttendanceActions";
import { useTodayAttendance } from "./hooks/useTodayAttendance";
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
  } = useTodayAttendance();

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
      <main className="flex min-h-screen items-center justify-center bg-white px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#D3F269]" />
          <p className="text-sm font-medium text-slate-600">
            Loading your attendance...
          </p>
        </div>
      </main>
    );
  }

  if (isError || !todayData) {
    const errorMessage = getErrorDetails(error).message;

    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-red-100 bg-red-50">
            <FiAlertCircle className="text-xl text-red-500" />
          </div>

          <h1 className="mt-5 text-lg font-bold text-slate-900">
            Unable to load attendance
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {errorMessage}
          </p>

          <button
            onClick={() => refetch()}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#D3F269] px-5 py-2.5 text-sm font-bold text-[#171719] transition hover:bg-[#C4E65C] focus:outline-none focus:ring-2 focus:ring-[#D3F269]/50 focus:ring-offset-2"
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
    <main className="min-h-screen bg-white px-4 py-7 text-[#171719] sm:px-6 sm:py-9 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-5">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B7D94D]" />
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Employee Portal
              </p>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#171719] sm:text-3xl">
              Welcome, {employee?.fullName ?? "Employee"}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Here's your attendance overview for today.
            </p>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#B7D94D] hover:bg-[#F8FBEF] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiRefreshCw
              className={isFetching ? "animate-spin text-[#8EAC31]" : ""}
            />
            Refresh
          </button>
        </header>

        <div className="space-y-6">
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
      </div>
    </main>
  );
}
