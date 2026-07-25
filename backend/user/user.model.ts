export interface UserPayload {
  email: string;
  password: string;
  name: string;
  disabled?: boolean;
  canManageUsers?: boolean;
}

export interface UserRecord extends UserPayload {
  id: string;
}

export interface UserUpdatePayload {
  email?: string;
  password?: string;
  name?: string;
  disabled?: boolean;
  canManageUsers?: boolean;
}
