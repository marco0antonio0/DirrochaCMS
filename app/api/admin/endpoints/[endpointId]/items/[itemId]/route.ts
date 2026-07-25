import { NextResponse } from "next/server";
import { itemService } from "@/backend/item/item.service";
import { withAuth } from "@/backend/common/serverAuth";
import { toErrorResponse } from "@/backend/common/apiError";

export const PATCH = withAuth(async (request, { params, actor }) => {
  try {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(
      await itemService.updateItem(
        { endpointId: params.endpointId, itemId: params.itemId, items: body?.items },
        actor,
      ),
    );
  } catch (error) {
    return toErrorResponse(error, "Erro ao atualizar item");
  }
}, { require: "write" });

export const DELETE = withAuth(async (_request, { params, actor }) => {
  try {
    return NextResponse.json(
      await itemService.deleteItem(
        { endpointId: params.endpointId, itemId: params.itemId },
        actor,
      ),
    );
  } catch (error) {
    return toErrorResponse(error, "Erro ao deletar o item");
  }
}, { require: "delete" });
