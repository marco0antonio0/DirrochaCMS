import { NextResponse } from "next/server";
import { historyService } from "@/backend/history/history.service";
import { withAuth } from "@/backend/common/serverAuth";
import { toErrorResponse } from "@/backend/common/apiError";

export const GET = withAuth(async (_request, { params }) => {
  try {
    return NextResponse.json(await historyService.list(params.endpointId));
  } catch (error) {
    return toErrorResponse(error, "Erro ao carregar historico");
  }
});
