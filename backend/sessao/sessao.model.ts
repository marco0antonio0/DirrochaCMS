export interface SessaoRecord {
  /** id do documento (`sid`), tambem presente nas claims do token */
  sid: string;
  userId: string;
  email: string;
  /** SHA-256 do token; o token em si nunca e persistido */
  tokenHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
