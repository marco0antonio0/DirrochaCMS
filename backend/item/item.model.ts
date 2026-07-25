import type { Actor } from "@/backend/common/actor";

export interface ItemFieldValue {
  title: string;
  value: unknown;
}

export interface ItemPayload {
  endpointId: string;
  items: ItemFieldValue[];
}

export interface ItemRecord {
  id: string;
  endpointId: string;
  formattedData: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: Actor;
  updatedBy?: Actor;
}
