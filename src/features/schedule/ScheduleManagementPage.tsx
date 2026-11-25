import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FiCalendar,
  FiClock,
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiTrash2,
} from "react-icons/fi";

import { adminApi } from "../../lib/api";

interface CompanySchedule {
  timeZone: string;
  workingDays: number[];
  checkIn: {
    officeStartTime: string;
    onTimeUntil: string;
    yellowLateUntil: string;
    redLateFrom: string;
    lateReasonRequired: boolean;
  };
  checkOut: {
    earlyCheckoutBefore: string;
    normalCheckoutUntil: string;
    noteRequiredAfter: string;
    latestCheckoutTime: string;
    autoCheckoutEnabled: boolean;
    autoCheckoutTime: string;
    flagAutoCheckoutForReview: boolean;
  };
  absence: {
    autoMarkAbsent: boolean;
    markAbsentAfter: string;
  };
}

interface Holiday {
  _id: string;
  date: string;
  name: string;
  description?: string;
}

interface ApiResponse<T> {
  message: string;
  data: T;
}

interface ScheduleResponse {
  schedule: CompanySchedule;
}

interface HolidaysResponse {
  holidays: Holiday[];
}

interface HolidayForm {
  date: string;
  name: string;
  description: string;
}

const DAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#F40026] focus:ring-2 focus:ring-[#F40026]/10";

const labelClass = "mb-1 block text-xs font-semibold text-slate-600";

const defaultHolidayForm: HolidayForm = {
  date: "",
  name: "",
  description: "",
};

function getErrorMessage(error: unknown): string {
  const axiosError = error as {
    response?: {
      data?: {
        message?: string;
        error?: string;
      };
    };
  };

  return (
    axiosError.response?.data?.message ||
    axiosError.response?.data?.error ||
    "Something went wrong. Please try again."
  );
}

function Section({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold text-[#030708]">{title}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>{label}</label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-100 px-3 py-2.5 transition hover:bg-slate-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-[#F40026]"
      />
      <span className="text-xs font-medium text-slate-700">{label}</span>
    </label>
  );
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <input
        type="time"
        className={inputClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
      />
    </Field>
  );
}

export default function ScheduleManagementPage() {
  const queryClient = useQueryClient();

  const [scheduleForm, setScheduleForm] = useState<CompanySchedule | null>(
    null,
  );
  const [holidayForm, setHolidayForm] =
    useState<HolidayForm>(defaultHolidayForm);
  const [editingHolidayId, setEditingHolidayId] = useState<string | null>(null);
  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const scheduleQuery = useQuery({
    queryKey: ["company-schedule"],
    queryFn: async () => {
      const response =
        await adminApi.get<ApiResponse<ScheduleResponse>>("/schedules/");
      return response.data.data.schedule;
    },
  });

  const holidaysQuery = useQuery({
    queryKey: ["company-holidays"],
    queryFn: async () => {
      const response = await adminApi.get<ApiResponse<HolidaysResponse>>(
        "/schedules/holidays",
      );
      return response.data.data.holidays;
    },
  });

  useEffect(() => {
    if (scheduleQuery.data) {
      setScheduleForm(scheduleQuery.data);
    }
  }, [scheduleQuery.data]);

  const updateScheduleMutation = useMutation({
    mutationFn: async (input: CompanySchedule) => {
      const response = await adminApi.patch<ApiResponse<ScheduleResponse>>(
        "/schedules/",
        input,
      );

      return response.data.data.schedule;
    },
    onSuccess: (schedule) => {
      queryClient.setQueryData(["company-schedule"], schedule);
      setScheduleForm(schedule);
      setPageError("");
      setSuccessMessage("Company schedule updated successfully.");
    },
    onError: (error) => {
      setPageError(getErrorMessage(error));
      setSuccessMessage("");
    },
  });

  const createHolidayMutation = useMutation({
    mutationFn: async (input: HolidayForm) => {
      await adminApi.post("/schedules/holidays", {
        date: input.date,
        name: input.name.trim(),
        ...(input.description.trim() && {
          description: input.description.trim(),
        }),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["company-holidays"],
      });
      setHolidayForm(defaultHolidayForm);
      setPageError("");
      setSuccessMessage("Holiday created successfully.");
    },
    onError: (error) => {
      setPageError(getErrorMessage(error));
      setSuccessMessage("");
    },
  });

  const updateHolidayMutation = useMutation({
    mutationFn: async ({
      id,
      name,
      description,
    }: {
      id: string;
      name: string;
      description: string;
    }) => {
      await adminApi.patch(`/schedules/holidays/${id}`, {
        name: name.trim(),
        description: description.trim() || null,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["company-holidays"],
      });
      setHolidayForm(defaultHolidayForm);
      setEditingHolidayId(null);
      setPageError("");
      setSuccessMessage("Holiday updated successfully.");
    },
    onError: (error) => {
      setPageError(getErrorMessage(error));
      setSuccessMessage("");
    },
  });

  const deleteHolidayMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminApi.delete(`/schedules/holidays/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["company-holidays"],
      });
      setPageError("");
      setSuccessMessage("Holiday deleted successfully.");
    },
    onError: (error) => {
      setPageError(getErrorMessage(error));
      setSuccessMessage("");
    },
  });

  function updateCheckIn(
    field: keyof CompanySchedule["checkIn"],
    value: string | boolean,
  ) {
    setScheduleForm((current) =>
      current
        ? {
            ...current,
            checkIn: { ...current.checkIn, [field]: value },
          }
        : current,
    );
  }

  function updateCheckOut(
    field: keyof CompanySchedule["checkOut"],
    value: string | boolean,
  ) {
    setScheduleForm((current) =>
      current
        ? {
            ...current,
            checkOut: { ...current.checkOut, [field]: value },
          }
        : current,
    );
  }

  function updateAbsence(
    field: keyof CompanySchedule["absence"],
    value: string | boolean,
  ) {
    setScheduleForm((current) =>
      current
        ? {
            ...current,
            absence: { ...current.absence, [field]: value },
          }
        : current,
    );
  }

  function toggleWorkingDay(day: number) {
    setScheduleForm((current) => {
      if (!current) return current;

      const exists = current.workingDays.includes(day);

      return {
        ...current,
        workingDays: exists
          ? current.workingDays.filter((item) => item !== day)
          : [...current.workingDays, day].sort((a, b) => a - b),
      };
    });
  }

  function handleScheduleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!scheduleForm) return;

    setPageError("");
    setSuccessMessage("");
    updateScheduleMutation.mutate(scheduleForm);
  }

  function handleHolidaySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPageError("");
    setSuccessMessage("");

    if (editingHolidayId) {
      updateHolidayMutation.mutate({
        id: editingHolidayId,
        name: holidayForm.name,
        description: holidayForm.description,
      });
    } else {
      createHolidayMutation.mutate(holidayForm);
    }
  }

  function startEditingHoliday(holiday: Holiday) {
    setEditingHolidayId(holiday._id);
    setHolidayForm({
      date: holiday.date,
      name: holiday.name,
      description: holiday.description ?? "",
    });
    setPageError("");
    setSuccessMessage("");
  }

  function cancelHolidayEdit() {
    setEditingHolidayId(null);
    setHolidayForm(defaultHolidayForm);
  }

  function handleDeleteHoliday(holiday: Holiday) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${holiday.name}"?`,
    );

    if (confirmed) {
      setPageError("");
      setSuccessMessage("");
      deleteHolidayMutation.mutate(holiday._id);
    }
  }

  if (scheduleQuery.isLoading || holidaysQuery.isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
        <FiRefreshCw className="mr-2 animate-spin" />
        Loading schedule...
      </div>
    );
  }

  if (scheduleQuery.isError || holidaysQuery.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        <p>{getErrorMessage(scheduleQuery.error || holidaysQuery.error)}</p>
        <button
          type="button"
          onClick={() => {
            void scheduleQuery.refetch();
            void holidaysQuery.refetch();
          }}
          className="mt-2 font-semibold underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!scheduleForm) return null;

  const isSavingSchedule = updateScheduleMutation.isPending;
  const isSavingHoliday =
    createHolidayMutation.isPending || updateHolidayMutation.isPending;

  return (
    <div className="space-y-4">
      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#F40026]" />
            <h1 className="text-xl font-bold text-[#030708]">
              Schedule & Holidays
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Manage working days, attendance timings, and company holidays.
          </p>
        </div>
      </div>

      {/* Feedback */}
      {(pageError || successMessage) && (
        <div
          role="status"
          className={`rounded-lg border px-3 py-2.5 text-sm ${
            pageError
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-slate-200 bg-slate-50 text-slate-700"
          }`}
        >
          {pageError || successMessage}
        </div>
      )}

      {/* Schedule settings */}
      <form onSubmit={handleScheduleSubmit} className="space-y-3">
        <Section
          title="Company Settings"
          description="Set your company timezone and regular working days."
        >
          <div className="grid gap-4 sm:grid-cols-[minmax(220px,1fr)_2fr]">
            <Field label="Company Timezone">
              <select
                className={inputClass}
                value={scheduleForm.timeZone}
                onChange={(event) =>
                  setScheduleForm((current) =>
                    current
                      ? { ...current, timeZone: event.target.value }
                      : current,
                  )
                }
              >
                <option value="Asia/Dhaka">Asia/Dhaka (Bangladesh)</option>
                <option value="UTC">UTC</option>
              </select>
            </Field>

            <div>
              <label className={labelClass}>Working Days</label>
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map((day) => {
                  const selected = scheduleForm.workingDays.includes(day.value);

                  return (
                    <button
                      key={day.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleWorkingDay(day.value)}
                      className={`min-w-12 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                        selected
                          ? "border-[#F40026] bg-[#F40026] text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
              {scheduleForm.workingDays.length === 0 && (
                <p className="mt-1.5 text-xs text-red-600">
                  Select at least one working day.
                </p>
              )}
            </div>
          </div>
        </Section>

        <Section
          title="Check-in Rules"
          description="Define office start time and late attendance thresholds."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <TimeField
              label="Office Start Time"
              value={scheduleForm.checkIn.officeStartTime}
              onChange={(value) => updateCheckIn("officeStartTime", value)}
            />
            <TimeField
              label="On-time Until"
              value={scheduleForm.checkIn.onTimeUntil}
              onChange={(value) => updateCheckIn("onTimeUntil", value)}
            />
            <TimeField
              label="Yellow Late Until"
              value={scheduleForm.checkIn.yellowLateUntil}
              onChange={(value) => updateCheckIn("yellowLateUntil", value)}
            />
            <TimeField
              label="Red Late From"
              value={scheduleForm.checkIn.redLateFrom}
              onChange={(value) => updateCheckIn("redLateFrom", value)}
            />
          </div>

          <div className="mt-3 border-t border-slate-100 pt-3">
            <Toggle
              label="Require a reason for late check-in"
              checked={scheduleForm.checkIn.lateReasonRequired}
              onChange={(value) => updateCheckIn("lateReasonRequired", value)}
            />
          </div>
        </Section>

        <Section
          title="Check-out Rules"
          description="Configure checkout thresholds and automatic checkout behavior."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <TimeField
              label="Early Checkout Before"
              value={scheduleForm.checkOut.earlyCheckoutBefore}
              onChange={(value) => updateCheckOut("earlyCheckoutBefore", value)}
            />
            <TimeField
              label="Normal Checkout Until"
              value={scheduleForm.checkOut.normalCheckoutUntil}
              onChange={(value) => updateCheckOut("normalCheckoutUntil", value)}
            />
            <TimeField
              label="Note Required After"
              value={scheduleForm.checkOut.noteRequiredAfter}
              onChange={(value) => updateCheckOut("noteRequiredAfter", value)}
            />
            <TimeField
              label="Latest Checkout Time"
              value={scheduleForm.checkOut.latestCheckoutTime}
              onChange={(value) => updateCheckOut("latestCheckoutTime", value)}
            />
            <TimeField
              label="Automatic Checkout Time"
              value={scheduleForm.checkOut.autoCheckoutTime}
              onChange={(value) => updateCheckOut("autoCheckoutTime", value)}
            />
          </div>

          <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3 md:grid-cols-2">
            <Toggle
              label="Enable automatic checkout"
              checked={scheduleForm.checkOut.autoCheckoutEnabled}
              onChange={(value) => updateCheckOut("autoCheckoutEnabled", value)}
            />
            <Toggle
              label="Flag automatic checkouts for admin review"
              checked={scheduleForm.checkOut.flagAutoCheckoutForReview}
              onChange={(value) =>
                updateCheckOut("flagAutoCheckoutForReview", value)
              }
            />
          </div>
        </Section>

        <Section
          title="Absence Rules"
          description="Configure when employees should automatically be marked absent."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <TimeField
              label="Mark Absent After"
              value={scheduleForm.absence.markAbsentAfter}
              onChange={(value) => updateAbsence("markAbsentAfter", value)}
            />
            <div className="flex items-end">
              <Toggle
                label="Automatically mark employees absent"
                checked={scheduleForm.absence.autoMarkAbsent}
                onChange={(value) => updateAbsence("autoMarkAbsent", value)}
              />
            </div>
          </div>
        </Section>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs text-slate-500">
            Changes apply to the company attendance schedule.
          </p>
          <button
            type="submit"
            disabled={isSavingSchedule || scheduleForm.workingDays.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#F40026] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d90022] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSavingSchedule ? (
              <FiRefreshCw className="animate-spin" />
            ) : (
              <FiSave />
            )}
            {isSavingSchedule ? "Saving..." : "Save Schedule"}
          </button>
        </div>
      </form>

      {/* Holiday management */}
      <Section
        title="Company Holidays"
        description="Add holidays that should not count as employee absences."
        action={
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
            {holidaysQuery.data?.length ?? 0} holidays
          </span>
        }
      >
        <form
          onSubmit={handleHolidaySubmit}
          className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3"
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F40026]/10 text-[#F40026]">
              {editingHolidayId ? <FiEdit2 size={14} /> : <FiPlus size={15} />}
            </span>
            <h3 className="text-sm font-bold text-[#030708]">
              {editingHolidayId ? "Edit Holiday" : "Add New Holiday"}
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Holiday Date">
              <input
                type="date"
                className={inputClass}
                value={holidayForm.date}
                disabled={Boolean(editingHolidayId)}
                onChange={(event) =>
                  setHolidayForm((current) => ({
                    ...current,
                    date: event.target.value,
                  }))
                }
                required={!editingHolidayId}
              />
            </Field>

            <Field label="Holiday Name">
              <input
                type="text"
                className={inputClass}
                placeholder="e.g. Independence Day"
                maxLength={100}
                value={holidayForm.name}
                onChange={(event) =>
                  setHolidayForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                required
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Description (Optional)">
                <textarea
                  className={inputClass}
                  rows={2}
                  maxLength={500}
                  placeholder="Add a short description..."
                  value={holidayForm.description}
                  onChange={(event) =>
                    setHolidayForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
              </Field>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={
                isSavingHoliday ||
                deleteHolidayMutation.isPending ||
                !holidayForm.name.trim() ||
                (!editingHolidayId && !holidayForm.date)
              }
              className="inline-flex items-center gap-2 rounded-lg bg-[#F40026] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#d90022] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSavingHoliday ? (
                <FiRefreshCw className="animate-spin" />
              ) : editingHolidayId ? (
                <FiSave />
              ) : (
                <FiPlus />
              )}
              {isSavingHoliday
                ? "Saving..."
                : editingHolidayId
                  ? "Update Holiday"
                  : "Add Holiday"}
            </button>

            {editingHolidayId && (
              <button
                type="button"
                onClick={cancelHolidayEdit}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {holidaysQuery.data?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2.5 font-semibold">Date</th>
                  <th className="px-3 py-2.5 font-semibold">Holiday</th>
                  <th className="px-3 py-2.5 font-semibold">Description</th>
                  <th className="px-3 py-2.5 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {holidaysQuery.data.map((holiday) => (
                  <tr
                    key={holiday._id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-500">
                      {holiday.date}
                    </td>
                    <td className="px-3 py-3 text-xs font-semibold text-[#030708]">
                      {holiday.name}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500">
                      {holiday.description || "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          title="Edit holiday"
                          aria-label={`Edit ${holiday.name}`}
                          onClick={() => startEditingHoliday(holiday)}
                          className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#030708]"
                        >
                          <FiEdit2 size={15} />
                        </button>
                        <button
                          type="button"
                          title="Delete holiday"
                          aria-label={`Delete ${holiday.name}`}
                          disabled={deleteHolidayMutation.isPending}
                          onClick={() => handleDeleteHoliday(holiday)}
                          className="rounded-md p-2 text-slate-500 transition hover:bg-red-50 hover:text-[#F40026] disabled:opacity-50"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-7 text-center">
            <FiCalendar className="mx-auto mb-2 text-xl text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">
              No holidays added yet
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Add a holiday using the form above.
            </p>
          </div>
        )}
      </Section>

      <div className="flex items-center gap-2 text-[11px] text-slate-400">
        <FiClock size={13} />
        Schedule times use the configured company timezone.
      </div>
    </div>
  );
}
