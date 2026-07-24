export interface SessaoPayload {
  email: string;
  token: string;
}

export interface SessaoRecord extends SessaoPayload {
  createdAt?: Date;
  updatedAt?: Date;
}
