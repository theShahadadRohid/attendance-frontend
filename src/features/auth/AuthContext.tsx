import { useCallback, useEffect, useState, type ReactNode } from "react";

import { adminApi, employeeApi } from "../../lib/api";

import {
  loginAdmin as loginAdminRequest,
  loginEmployee as loginEmployeeRequest,
  logoutAdmin as logoutAdminRequest,
  logoutEmployee as logoutEmployeeRequest,
  getAdminToken,
  getEmployeeToken,
} from "./auth.service";

import { AuthContext } from "./auth.context";

import type {
  Admin,
  Employee,
  AdminLoginInput,
  EmployeeLoginInput,
  ApiResponse,
} from "./auth.types";

type AdminSession = Pick<Admin, "id" | "role"> &
  Partial<Pick<Admin, "fullName" | "email">>;

type EmployeeSession = Employee & {
  employmentType?: string;
  department?: string;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [employee, setEmployee] = useState<EmployeeSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSessions() {
      const adminToken = getAdminToken();
      const employeeToken = getEmployeeToken();

      const tasks: Promise<void>[] = [];

      if (adminToken) {
        tasks.push(
          adminApi
            .get<ApiResponse<Pick<Admin, "id" | "role">>>("/auth/me")
            .then(({ data }) => {
              if (!cancelled) {
                setAdmin(data.data);
              }
            })
            .catch(() => {
              logoutAdminRequest();
            }),
        );
      }

      if (employeeToken) {
        tasks.push(
          employeeApi
            .get<ApiResponse<EmployeeSession>>("/auth/employee/me")
            .then(({ data }) => {
              if (!cancelled) {
                setEmployee(data.data);
              }
            })
            .catch(() => {
              logoutEmployeeRequest();
            }),
        );
      }

      await Promise.all(tasks);

      if (!cancelled) {
        setIsInitializing(false);
      }
    }

    void restoreSessions();

    return () => {
      cancelled = true;
    };
  }, []);

  const loginAdmin = useCallback(async (input: AdminLoginInput) => {
    const result = await loginAdminRequest(input);

    setAdmin(result.admin);
    setEmployee(null);
  }, []);

  const loginEmployee = useCallback(async (input: EmployeeLoginInput) => {
    const result = await loginEmployeeRequest(input);

    setEmployee(result.employee);
    setAdmin(null);
  }, []);

  const logoutAdmin = useCallback(() => {
    logoutAdminRequest();
    setAdmin(null);
  }, []);

  const logoutEmployee = useCallback(() => {
    logoutEmployeeRequest();
    setEmployee(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        admin,
        employee,
        isInitializing,
        loginAdmin,
        loginEmployee,
        logoutAdmin,
        logoutEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
