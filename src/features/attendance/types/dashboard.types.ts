export interface DashboardSummary {
  totalEmployees: number;
  present: number;
  late: number;
  absent: number;
  notCheckedIn: number;
}

export interface NotCheckedInEmployee {
  _id: string;
  employeeCode: string;
  fullName: string;
  phoneNumber: string;
  department?: string;
}

export interface DashboardData {
  date: string;
  summary: DashboardSummary;
  notCheckedInEmployees: NotCheckedInEmployee[];
}
