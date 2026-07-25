import { NextResponse } from "next/server";
import { endpointService } from "@/backend/endpoint/endpoint.service";
import { withAuth } from "@/backend/common/serverAuth";
import { toErrorResponse } from "@/backend/common/apiError";

export const GET = withAuth(async () => {
  try {
    return NextResponse.json(await endpointService.listEndpoints());
  } catch (error) {
    return toErrorResponse(error, "Erro ao listar endpoints");
  }
});

export const POST = withAuth(async (request, { actor }) => {
  try {
    const body = await request.json().catch(() => ({}));

    const result = await endpointService.addEndpoint(
      {
        title: body?.title,
        router: body?.router,
        campos: Array.isArray(body?.campos) ? body.campos : [],
        fixedValuesEnabled: body?.fixedValuesEnabled === true,
        cacheTtlSeconds: typeof body?.cacheTtlSeconds === "number" ? body.cacheTtlSeconds : undefined,
        accessMode: body?.accessMode === "password" ? "password" : "public",
        accessPassword: typeof body?.accessPassword === "string" ? body.accessPassword : undefined,
      },
      actor,
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "Erro ao criar endpoint");
  }
}, { require: "write" });
