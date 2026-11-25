export interface AttendanceRecord {
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

export interface TodayAttendanceResponse {
  date: string;
  timeZone: string;
  attendance: AttendanceRecord | null;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface AttendanceActionInput {
  location: {
    latitude: number;
    longitude: number;
  };
  reason?: string;
  note?: string;
}
