import { createContext } from "react";

import type {
  Admin,
  Employee,
  AdminLoginInput,
  EmployeeLoginInput,
} from "./auth.types";

type AdminSession = Pick<Admin, "id" | "role"> &
  Partial<Pick<Admin, "fullName" | "email">>;

type EmployeeSession = Employee & {
  employmentType?: string;
  department?: string;
};

export interface AuthContextValue {
  admin: AdminSession | null;
  employee: EmployeeSession | null;
  isInitializing: boolean;

  loginAdmin: (input: AdminLoginInput) => Promise<void>;
  loginEmployee: (input: EmployeeLoginInput) => Promise<void>;

  logoutAdmin: () => void;
  logoutEmployee: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
