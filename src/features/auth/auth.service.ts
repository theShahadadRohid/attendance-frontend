import { adminApi, employeeApi } from "../../lib/api";

import type {
  AdminLoginInput,
  AdminLoginResponse,
  EmployeeLoginInput,
  EmployeeLoginResponse,
  ApiResponse,
} from "./auth.types";

const ADMIN_TOKEN_KEY = "attendance_admin_token";
const EMPLOYEE_TOKEN_KEY = "attendance_employee_token";

export async function loginAdmin(
  input: AdminLoginInput,
): Promise<AdminLoginResponse> {
  const response = await adminApi.post<ApiResponse<AdminLoginResponse>>(
    "/auth/login",
    input,
  );

  const data = response.data.data;

  localStorage.setItem(ADMIN_TOKEN_KEY, data.accessToken);

  return data;
}

export async function loginEmployee(
  input: EmployeeLoginInput,
): Promise<EmployeeLoginResponse> {
  const response = await employeeApi.post<ApiResponse<EmployeeLoginResponse>>(
    "/auth/employee/login",
    input,
  );

  const data = response.data.data;

  localStorage.setItem(EMPLOYEE_TOKEN_KEY, data.accessToken);

  return data;
}

export function logoutAdmin(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function logoutEmployee(): void {
  localStorage.removeItem(EMPLOYEE_TOKEN_KEY);
}

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getEmployeeToken(): string | null {
  return localStorage.getItem(EMPLOYEE_TOKEN_KEY);
}
