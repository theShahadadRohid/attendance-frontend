import { useState } from "react";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

import { useAuth } from "../auth/useAuth";

import { getErrorDetails } from "./utils/attendance-errors";
import { getCurrentLocation, type Coordinates } from "./utils/geolocation";

import { AttendanceSummary } from "./components/AttendanceSummary";
import { AttendanceActions } from "./components/AttendanceActions";
import { useTodayAttendance } from "./hooks/useTodayAttendance";
import { useAttendanceActions } from "./hooks/useAttendanceActions";

const OFFICE_LOCATION = {
  latitude: 22.359923,
  longitude: 91.82385,
};

const OFFICE_RADIUS_METERS = 50;

type LocationAction = "check-in" | "check-out" | null;

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
  const [locationAction, setLocationAction] = useState<LocationAction>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

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
        setCurrentLocation(null);
        setLocationAction(null);
      },

      onCheckOutSuccess: () => {
        setCheckOutNote("");
        setShowCheckOutNote(false);
        setCurrentLocation(null);
        setLocationAction(null);
      },
    });

  async function detectLocation(action: Exclude<LocationAction, null>) {
    try {
      setActionError("");
      setIsDetectingLocation(true);

      const location = await getCurrentLocation();

      setCurrentLocation(location);
      setLocationAction(action);
    } catch (error) {
      setLocationAction(null);
      setActionError(
        error instanceof Error ? error.message : "Unable to get your location.",
      );
    } finally {
      setIsDetectingLocation(false);
    }
  }

  async function handleCheckIn() {
    setActionError("");

    if (showCheckInReason && !checkInReason.trim()) {
      setActionError("Please enter your late check-in reason.");
      return;
    }

    if (locationAction !== "check-in" || !currentLocation) {
      await detectLocation("check-in");
      return;
    }

    checkInMutation.mutate({
      location: currentLocation,
      ...(checkInReason.trim() && {
        reason: checkInReason.trim(),
      }),
    });
  }

  async function handleCheckOut() {
    setActionError("");

    if (showCheckOutNote && !checkOutNote.trim()) {
      setActionError("Please enter your checkout note.");
      return;
    }

    if (locationAction !== "check-out" || !currentLocation) {
      await detectLocation("check-out");
      return;
    }

    checkOutMutation.mutate({
      location: currentLocation,
      ...(checkOutNote.trim() && {
        note: checkOutNote.trim(),
      }),
    });
  }

  if (isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-white px-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-5">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#F40026]" />
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
      <main className="flex min-h-[60vh] items-center justify-center bg-white px-4 py-8">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-red-100 bg-red-50">
            <FiAlertCircle className="text-xl text-[#F40026]" />
          </div>

          <h1 className="mt-5 text-lg font-bold text-[#030708]">
            Unable to load attendance
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {errorMessage}
          </p>

          <button
            onClick={() => refetch()}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#F40026] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D90022] focus:outline-none focus:ring-2 focus:ring-[#F40026]/30 focus:ring-offset-2"
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
    <main className="min-h-full w-full bg-white text-[#030708]">
      <div className="w-full">
        {/* Page header */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#F40026]" />
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Employee Portal
              </p>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#030708] sm:text-3xl">
              Welcome, {employee?.fullName ?? "Employee"}
            </h1>

            <p className="mt-1.5 text-sm text-slate-500">
              Manage your attendance and check your daily activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#030708] transition hover:border-[#F40026] hover:text-[#F40026] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiRefreshCw
              className={isFetching ? "animate-spin text-[#F40026]" : ""}
            />
            Refresh
          </button>
        </header>

        {/* Dashboard columns */}
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2 xl:gap-6">
          {/* Attendance actions: first on mobile, right on desktop */}
          <section className="order-1 min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:order-2">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-[#030708]">
                Attendance Actions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Check in when you arrive and check out when you finish work.
                Your location will be detected automatically.
              </p>
            </div>

            <AttendanceActions
              hasCheckedIn={hasCheckedIn}
              hasCheckedOut={hasCheckedOut}
              isSubmitting={isSubmitting}
              isCheckingIn={checkInMutation.isPending}
              isCheckingOut={checkOutMutation.isPending}
              isDetectingLocation={isDetectingLocation}
              locationAction={locationAction}
              currentLocation={currentLocation}
              officeLocation={OFFICE_LOCATION}
              officeRadiusMeters={OFFICE_RADIUS_METERS}
              onPositionChange={setCurrentLocation}
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

          {/* Today's timing: second on mobile, left on desktop */}
          <section className="order-2 min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:order-1">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-[#030708]">
                Today's Attendance
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Your check-in and check-out activity for today.
              </p>
            </div>

            <AttendanceSummary
              attendance={attendance}
              date={todayData.date}
              timeZone={timeZone}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
