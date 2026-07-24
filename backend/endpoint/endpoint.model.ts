export interface EndpointField {
  name: string;
  type: "string" | "number" | "date" | "img";
  mult?: boolean;
}

export interface EndpointPayload {
  title: string;
  router: string;
  campos: Array<string | EndpointField>;
  fixedValuesEnabled?: boolean;
  cacheTtlSeconds?: number;
}

export interface EndpointUpdatePayload {
  title?: string;
  router?: string;
  fixedValuesEnabled?: boolean;
  cacheTtlSeconds?: number;
  cacheRefreshedAt?: Date;
  updatedAt?: Date;
}

export interface EndpointRecord extends EndpointPayload {
  id: string;
  createdAt?: Date;
}
