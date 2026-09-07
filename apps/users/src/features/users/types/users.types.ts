export type UserRole = "ADMIN" | "OPERATOR" | "AUDITOR" | "USER";

export type UserStatus = "ACTIVE" | "INACTIVE" | "PENDING";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  department?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserFilters {
  search?: string;
  role?: UserRole | "ALL";
  status?: UserStatus | "ALL";
}

export interface CreateUserPayload {
  name: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  phone?: string;
  department?: string;
}

export interface UpdateUserPayload extends Partial<CreateUserPayload> {
  id: string;
}
