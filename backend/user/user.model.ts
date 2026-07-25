import type { UserRole } from "@/backend/user/user.entity";

export interface UserPayload {
  email: string;
  password: string;
  name: string;
  disabled?: boolean;
  role?: UserRole;
}

/** Forma segura de um usuario para consumo da API: sem `password`. */
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  disabled: boolean;
  role: UserRole;
  /** Derivado do papel; mantido para a UI nao precisar reimplementar a tabela. */
  canManageUsers: boolean;
}

export interface UserUpdatePayload {
  email?: string;
  password?: string;
  name?: string;
  disabled?: boolean;
  role?: UserRole;
}
