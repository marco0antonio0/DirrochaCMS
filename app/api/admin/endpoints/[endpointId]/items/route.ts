import { NextResponse } from "next/server";
import { itemService } from "@/backend/item/item.service";
import { withAuth } from "@/backend/common/serverAuth";
import { toErrorResponse } from "@/backend/common/apiError";

export const GET = withAuth(async (_request, { params }) => {
  try {
    return NextResponse.json(await itemService.getItems(params.endpointId));
  } catch (error) {
    return toErrorResponse(error, "Erro ao buscar itens do endpoint");
  }
});

export const POST = withAuth(async (request, { params, actor }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await itemService.createItem(
      { endpointId: params.endpointId, items: body?.items },
      actor,
    );
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "Erro ao criar item");
  }
}, { require: "write" });
