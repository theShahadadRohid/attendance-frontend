import { useEffect, useState, type FormEvent } from "react";
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
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";

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
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="font-semibold text-slate-800">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
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
    <label className="flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-slate-300 accent-blue-600"
      />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

const defaultHolidayForm: HolidayForm = {
  date: "",
  name: "",
  description: "",
};

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
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        <p>{getErrorMessage(scheduleQuery.error || holidaysQuery.error)}</p>
        <button
          type="button"
          onClick={() => {
            void scheduleQuery.refetch();
            void holidaysQuery.refetch();
          }}
          className="mt-3 font-medium underline"
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Schedule & Holidays
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure company working days, attendance timings, and holidays.
        </p>
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

      <form onSubmit={handleScheduleSubmit} className="space-y-6">
        <Section
          title="Company Settings"
          description="Set the timezone and the regular working days."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Timezone">
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
          </div>

          <div className="mt-5">
            <label className={labelClass}>Working Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => {
                const selected = scheduleForm.workingDays.includes(day.value);

                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleWorkingDay(day.value)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      selected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
            {scheduleForm.workingDays.length === 0 && (
              <p className="mt-2 text-xs text-red-600">
                Select at least one working day.
              </p>
            )}
          </div>
        </Section>

        <Section
          title="Check-in Rules"
          description="Configure office start time and late attendance rules."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Office Start Time">
              <input
                type="time"
                className={inputClass}
                value={scheduleForm.checkIn.officeStartTime}
                onChange={(event) =>
                  updateCheckIn("officeStartTime", event.target.value)
                }
                required
              />
            </Field>

            <Field label="On-time Until">
              <input
                type="time"
                className={inputClass}
                value={scheduleForm.checkIn.onTimeUntil}
                onChange={(event) =>
                  updateCheckIn("onTimeUntil", event.target.value)
                }
                required
              />
            </Field>

            <Field label="Yellow Late Until">
              <input
                type="time"
                className={inputClass}
                value={scheduleForm.checkIn.yellowLateUntil}
                onChange={(event) =>
                  updateCheckIn("yellowLateUntil", event.target.value)
                }
                required
              />
            </Field>

            <Field label="Red Late From">
              <input
                type="time"
                className={inputClass}
                value={scheduleForm.checkIn.redLateFrom}
                onChange={(event) =>
                  updateCheckIn("redLateFrom", event.target.value)
                }
                required
              />
            </Field>
          </div>

          <div className="mt-5">
            <Toggle
              label="Require a reason for late check-in"
              checked={scheduleForm.checkIn.lateReasonRequired}
              onChange={(value) => updateCheckIn("lateReasonRequired", value)}
            />
          </div>
        </Section>

        <Section
          title="Check-out Rules"
          description="Configure checkout timing and automatic checkout behavior."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Early Checkout Before">
              <input
                type="time"
                className={inputClass}
                value={scheduleForm.checkOut.earlyCheckoutBefore}
                onChange={(event) =>
                  updateCheckOut("earlyCheckoutBefore", event.target.value)
                }
                required
              />
            </Field>

            <Field label="Normal Checkout Until">
              <input
                type="time"
                className={inputClass}
                value={scheduleForm.checkOut.normalCheckoutUntil}
                onChange={(event) =>
                  updateCheckOut("normalCheckoutUntil", event.target.value)
                }
                required
              />
            </Field>

            <Field label="Note Required After">
              <input
                type="time"
                className={inputClass}
                value={scheduleForm.checkOut.noteRequiredAfter}
                onChange={(event) =>
                  updateCheckOut("noteRequiredAfter", event.target.value)
                }
                required
              />
            </Field>

            <Field label="Latest Checkout Time">
              <input
                type="time"
                className={inputClass}
                value={scheduleForm.checkOut.latestCheckoutTime}
                onChange={(event) =>
                  updateCheckOut("latestCheckoutTime", event.target.value)
                }
                required
              />
            </Field>

            <Field label="Automatic Checkout Time">
              <input
                type="time"
                className={inputClass}
                value={scheduleForm.checkOut.autoCheckoutTime}
                onChange={(event) =>
                  updateCheckOut("autoCheckoutTime", event.target.value)
                }
                required
              />
            </Field>
          </div>

          <div className="mt-5 space-y-3">
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
          description="Configure automatic absence processing."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mark Absent After">
              <input
                type="time"
                className={inputClass}
                value={scheduleForm.absence.markAbsentAfter}
                onChange={(event) =>
                  updateAbsence("markAbsentAfter", event.target.value)
                }
                required
              />
            </Field>
          </div>

          <div className="mt-5">
            <Toggle
              label="Automatically mark employees absent"
              checked={scheduleForm.absence.autoMarkAbsent}
              onChange={(value) => updateAbsence("autoMarkAbsent", value)}
            />
          </div>
        </Section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSavingSchedule || scheduleForm.workingDays.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiSave />
            {isSavingSchedule ? "Saving..." : "Save Schedule"}
          </button>
        </div>
      </form>

      <Section
        title="Company Holidays"
        description="Add extra holidays that should not count as employee absences."
      >
        <form
          onSubmit={handleHolidaySubmit}
          className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4"
        >
          <h3 className="mb-4 text-sm font-semibold text-slate-800">
            {editingHolidayId ? "Edit Holiday" : "Add New Holiday"}
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
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

            <div className="md:col-span-2">
              <Field label="Description (Optional)">
                <textarea
                  className={inputClass}
                  rows={2}
                  maxLength={500}
                  placeholder="Holiday details..."
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

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={
                isSavingHoliday ||
                deleteHolidayMutation.isPending ||
                !holidayForm.name.trim() ||
                (!editingHolidayId && !holidayForm.date)
              }
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {editingHolidayId ? <FiSave /> : <FiPlus />}
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
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {holidaysQuery.data?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-3 font-semibold">Date</th>
                  <th className="px-3 py-3 font-semibold">Holiday</th>
                  <th className="px-3 py-3 font-semibold">Description</th>
                  <th className="px-3 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {holidaysQuery.data.map((holiday) => (
                  <tr
                    key={holiday._id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-3 py-4 whitespace-nowrap text-slate-600">
                      {holiday.date}
                    </td>
                    <td className="px-3 py-4 font-medium text-slate-800">
                      {holiday.name}
                    </td>
                    <td className="px-3 py-4 text-slate-500">
                      {holiday.description || "—"}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          title="Edit holiday"
                          onClick={() => startEditingHoliday(holiday)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          type="button"
                          title="Delete holiday"
                          disabled={deleteHolidayMutation.isPending}
                          onClick={() => handleDeleteHoliday(holiday)}
                          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center">
            <FiCalendar className="mx-auto mb-3 text-2xl text-slate-300" />
            <p className="text-sm font-medium text-slate-600">
              No holidays added yet.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Add a holiday using the form above.
            </p>
          </div>
        )}
      </Section>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <FiClock />
        Schedule times are interpreted using the configured company timezone.
      </div>
    </div>
  );
}
