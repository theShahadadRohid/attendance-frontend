import { createContext } from "react";

import type {
  AdminLoginInput,
  EmployeeLoginInput,
  AdminSession,
  EmployeeSession,
} from "./auth.types";

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
