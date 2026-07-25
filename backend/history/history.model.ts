import type { Actor } from "@/backend/common/actor";

export type HistoryAction =
  | "endpoint_created"
  | "endpoint_updated"
  | "item_created"
  | "item_updated"
  | "item_deleted";

export interface HistoryEntryPayload {
  action: HistoryAction;
  actor: Actor;
  itemId?: string;
  summary?: string;
}

export interface HistoryEntryRecord extends HistoryEntryPayload {
  id: string;
  createdAt?: Date;
}
