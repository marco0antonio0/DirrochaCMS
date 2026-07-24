import { itemController, ItemController } from "@/backend/item/item.controller";
import { itemRepository, ItemRepository } from "@/backend/item/item.repository";
import { itemService, ItemService } from "@/backend/item/item.service";

export class ItemModule {
  readonly controller: ItemController;
  readonly service: ItemService;
  readonly repository: ItemRepository;

  constructor() {
    this.repository = itemRepository;
    this.service = itemService;
    this.controller = itemController;
  }
}

export const itemModule = new ItemModule();
