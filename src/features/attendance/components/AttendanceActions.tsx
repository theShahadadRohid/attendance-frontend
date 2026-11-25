import {
  FiAlertCircle,
  FiCheckCircle,
  FiLogIn,
  FiLogOut,
  FiMapPin,
} from "react-icons/fi";

interface AttendanceActionsProps {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  isSubmitting: boolean;
  isCheckingIn: boolean;
  isCheckingOut: boolean;
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
  return (
    <>
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
                  onChange={(event) =>
                    onCheckInReasonChange(event.target.value)
                  }
                  rows={3}
                  maxLength={500}
                  placeholder="Explain why you are checking in late..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>
            )}

            <button
              type="button"
              onClick={onCheckIn}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <FiLogIn />
              {isCheckingIn ? "Checking in..." : "Check in"}
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
                  onChange={(event) => onCheckOutNoteChange(event.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Explain your late checkout..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>
            )}

            <button
              type="button"
              onClick={onCheckOut}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <FiLogOut />
              {isCheckingOut ? "Checking out..." : "Check out"}
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
          Attendance is accepted only when the submitted coordinates are within
          the configured office radius.
        </p>
      </div>
    </>
  );
}
