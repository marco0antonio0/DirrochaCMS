import { itemService, ItemService } from "@/backend/item/item.service";

export class ItemController {
  constructor(private readonly service: ItemService) {}

  createItem = this.service.createItem.bind(this.service);
  getItems = this.service.getItems.bind(this.service);
  updateItem = this.service.updateItem.bind(this.service);
  deleteItem = this.service.deleteItem.bind(this.service);
}

export const itemController = new ItemController(itemService);
