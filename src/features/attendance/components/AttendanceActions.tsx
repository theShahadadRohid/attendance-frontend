import {
  FiAlertCircle,
  FiCheckCircle,
  FiLogIn,
  FiLogOut,
  FiMapPin,
  FiNavigation,
} from "react-icons/fi";

import LocationPickerMap from "../LocationPickerMap";
import type { Coordinates } from "../utils/geolocation";

type LocationAction = "check-in" | "check-out" | null;

interface AttendanceActionsProps {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  isSubmitting: boolean;
  isCheckingIn: boolean;
  isCheckingOut: boolean;
  isDetectingLocation: boolean;
  locationAction: LocationAction;
  currentLocation: Coordinates | null;
  officeLocation: Coordinates;
  officeRadiusMeters: number;
  onPositionChange: (position: Coordinates) => void;
  showCheckInReason: boolean;
  showCheckOutNote: boolean;
  checkInReason: string;
  checkOutNote: string;
  actionError: string;
  onCheckInReasonChange: (value: string) => void;
  onCheckOutNoteChange: (value: string) => void;
  onCheckIn: () => void;
  onCheckOut: () => void;
}

export function AttendanceActions({
  hasCheckedIn,
  hasCheckedOut,
  isSubmitting,
  isCheckingIn,
  isCheckingOut,
  isDetectingLocation,
  locationAction,
  currentLocation,
  officeLocation,
  officeRadiusMeters,
  onPositionChange,
  showCheckInReason,
  showCheckOutNote,
  checkInReason,
  checkOutNote,
  actionError,
  onCheckInReasonChange,
  onCheckOutNoteChange,
  onCheckIn,
  onCheckOut,
}: AttendanceActionsProps) {
  const textareaClassName =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#030708] outline-none transition placeholder:text-slate-400 focus:border-[#030708] focus:ring-2 focus:ring-[#030708]/10";

  const checkInReasonClassName =
    "w-full rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-[#030708] outline-none transition placeholder:text-red-400 focus:border-[#F40026] focus:ring-2 focus:ring-[#F40026]/20";

  const checkInLocationReady = locationAction === "check-in" && currentLocation;
  const checkOutLocationReady =
    locationAction === "check-out" && currentLocation;

  const isCheckInLoading = isDetectingLocation && !hasCheckedIn;
  const isCheckOutLoading = isDetectingLocation && hasCheckedIn;

  return (
    <>
      <div className="space-y-5">
        {/* Check-in */}
        {!hasCheckedIn && (
          <div>
            {showCheckInReason && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50/70 p-4">
                <div className="mb-3 flex items-start gap-2">
                  <FiAlertCircle className="mt-0.5 shrink-0 text-lg text-[#F40026]" />

                  <div>
                    <label className="block text-sm font-bold text-[#F40026]">
                      Reason for late check-in
                    </label>

                    <p className="mt-1 text-xs leading-5 text-red-600">
                      Please explain why you are checking in late.
                    </p>
                  </div>
                </div>

                <textarea
                  value={checkInReason}
                  onChange={(event) =>
                    onCheckInReasonChange(event.target.value)
                  }
                  rows={3}
                  maxLength={500}
                  placeholder="Explain why you are checking in late..."
                  className={checkInReasonClassName}
                />

                <p className="mt-1.5 text-right text-xs font-medium text-red-500">
                  {checkInReason.length}/500
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={onCheckIn}
              disabled={isSubmitting || isDetectingLocation}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F40026] px-5 py-4 text-base font-bold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-[#F40026]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCheckInLoading ? (
                <FiNavigation className="animate-pulse text-lg" />
              ) : (
                <FiLogIn className="text-lg" />
              )}

              {isCheckInLoading
                ? "Detecting location..."
                : isCheckingIn
                  ? "Checking in..."
                  : checkInLocationReady
                    ? "Confirm Check in"
                    : "Check in"}
            </button>

            {checkInLocationReady && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  <FiMapPin className="shrink-0 text-[#F40026]" />
                  Location detected. Verify your position before checking in.
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <LocationPickerMap
                    position={currentLocation}
                    officeLocation={officeLocation}
                    radiusMeters={officeRadiusMeters}
                    onPositionChange={onPositionChange}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Check-out */}
        {hasCheckedIn && !hasCheckedOut && (
          <div>
            {showCheckOutNote && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-semibold text-[#030708]">
                  Reason for late checkout
                </label>

                <textarea
                  value={checkOutNote}
                  onChange={(event) => onCheckOutNoteChange(event.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Explain your late checkout..."
                  className={textareaClassName}
                />

                <p className="mt-1.5 text-right text-xs text-slate-400">
                  {checkOutNote.length}/500
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={onCheckOut}
              disabled={isSubmitting || isDetectingLocation}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#030708] px-5 py-4 text-base font-bold text-white transition hover:bg-[#202526] focus:outline-none focus:ring-2 focus:ring-[#030708]/30 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCheckOutLoading ? (
                <FiNavigation className="animate-pulse text-lg" />
              ) : (
                <FiLogOut className="text-lg" />
              )}

              {isCheckOutLoading
                ? "Detecting location..."
                : isCheckingOut
                  ? "Checking out..."
                  : checkOutLocationReady
                    ? "Confirm Check out"
                    : "Check out"}
            </button>

            {checkOutLocationReady && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  <FiMapPin className="shrink-0 text-[#F40026]" />
                  Location detected. Verify your position before checking out.
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <LocationPickerMap
                    position={currentLocation}
                    officeLocation={officeLocation}
                    radiusMeters={officeRadiusMeters}
                    onPositionChange={onPositionChange}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Completed */}
        {hasCheckedOut && (
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-[#030708]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#030708] text-white">
              <FiCheckCircle className="text-lg" />
            </span>

            <span>Your attendance for today is complete.</span>
          </div>
        )}
      </div>

      {/* Action error */}
      {actionError && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <FiAlertCircle className="mt-0.5 shrink-0 text-base" />
          <p>{actionError}</p>
        </div>
      )}

      {/* Location requirement */}
      <div className="mt-6 flex items-start gap-3 border-t border-slate-100 pt-5 text-xs leading-5 text-slate-500">
        <FiMapPin className="mt-0.5 shrink-0 text-[#F40026]" />

        <p>
          Your browser location is required for check-in and check-out.
          Attendance is accepted only when the submitted coordinates are within
          the configured office radius.
        </p>
      </div>
    </>
  );
}
