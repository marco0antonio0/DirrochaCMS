import { NextResponse } from "next/server";
import { endpointService } from "@/backend/endpoint/endpoint.service";
import { withAuth } from "@/backend/common/serverAuth";
import { toErrorResponse } from "@/backend/common/apiError";

export const POST = withAuth(async (_request, { params, actor }) => {
  try {
    const result = await endpointService.refreshEndpointCache(params.endpointId, actor);
    return NextResponse.json({
      success: true,
      cacheRefreshedAt: result.cacheRefreshedAt.toISOString(),
    });
  } catch (error) {
    return toErrorResponse(error, "Erro ao atualizar cache");
  }
}, { require: "write" });
