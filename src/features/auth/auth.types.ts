export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface EmployeeLoginInput {
  phoneNumber: string;
  password: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}

export interface Admin {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  designation: string;
  phoneNumber: string;
  officialEmail: string;
  mustChangePassword: boolean;
}

export interface AdminLoginResponse extends AuthTokenResponse {
  admin: Admin;
}

export interface EmployeeLoginResponse extends AuthTokenResponse {
  employee: Employee;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
