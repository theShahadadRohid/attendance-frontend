import type { AttendanceRecord } from "../types/attendance.types";

export function formatTime(value: string | undefined, timeZone: string) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-BD", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  }).format(new Date(value));
}

export function formatDate(value: string, timeZone: string) {
  const date = new Date(`${value}T12:00:00`);

  return new Intl.DateTimeFormat("en-BD", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone,
  }).format(date);
}

export function getCheckInLabel(status?: AttendanceRecord["checkInStatus"]) {
  switch (status) {
    case "on_time":
      return "On time";
    case "late_yellow":
    case "late_red":
      return "Late";
    default:
      return "Not checked in";
  }
}
