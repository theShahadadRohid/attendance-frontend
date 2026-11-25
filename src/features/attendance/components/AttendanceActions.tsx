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
  const textareaClassName =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#171719] outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#A9CC42] focus:ring-2 focus:ring-[#D3F269]/30";

  const buttonClassName =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#171719] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#303034] focus:outline-none focus:ring-2 focus:ring-[#D3F269]/60 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto";

  return (
    <>
      <div className="mt-7 border-t border-slate-100 pt-6">
        {!hasCheckedIn && (
          <div>
            {showCheckInReason && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-semibold text-[#171719]">
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
                  className={textareaClassName}
                />

                <p className="mt-1.5 text-right text-xs text-slate-400">
                  {checkInReason.length}/500
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={onCheckIn}
              disabled={isSubmitting}
              className={buttonClassName}
            >
              <FiLogIn className="text-[#D3F269]" />
              {isCheckingIn ? "Checking in..." : "Check in"}
            </button>
          </div>
        )}

        {hasCheckedIn && !hasCheckedOut && (
          <div>
            {showCheckOutNote && (
              <div className="mb-4">
                <label className="mb-2 block text-sm font-semibold text-[#171719]">
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
              disabled={isSubmitting}
              className={buttonClassName}
            >
              <FiLogOut className="text-[#D3F269]" />
              {isCheckingOut ? "Checking out..." : "Check out"}
            </button>
          </div>
        )}

        {hasCheckedOut && (
          <div className="flex items-center gap-3 rounded-xl border border-[#DCE9B9] bg-[#F7FAEF] p-4 text-sm font-semibold text-[#607B20]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAF3D1]">
              <FiCheckCircle className="text-lg" />
            </span>
            <span>Your attendance for today is complete.</span>
          </div>
        )}
      </div>

      {actionError && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <FiAlertCircle className="mt-0.5 shrink-0 text-base" />
          <p>{actionError}</p>
        </div>
      )}

      <div className="mt-6 flex items-start gap-3 border-t border-slate-100 pt-5 text-xs leading-5 text-slate-500">
        <FiMapPin className="mt-0.5 shrink-0 text-[#8EAC31]" />
        <p>
          Your browser location is required for check-in and check-out.
          Attendance is accepted only when the submitted coordinates are within
          the configured office radius.
        </p>
      </div>
    </>
  );
}
