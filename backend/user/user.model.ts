export interface UserPayload {
  email: string;
  password: string;
  name: string;
}

export interface UserRecord extends UserPayload {
  id: string;
}

export interface AuthVisibilitySettings {
  login: boolean;
  register: boolean;
  logout: boolean;
}
