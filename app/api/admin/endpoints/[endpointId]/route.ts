import { NextResponse } from "next/server";
import { endpointService } from "@/backend/endpoint/endpoint.service";
import { endpointRepository } from "@/backend/endpoint/endpoint.repository";
import { withAuth } from "@/backend/common/serverAuth";
import { toErrorResponse } from "@/backend/common/apiError";
import type { EndpointUpdatePayload } from "@/backend/endpoint/endpoint.model";

export const GET = withAuth(async (_request, { params }) => {
  try {
    const endpoint = await endpointRepository.getEndpointById(params.endpointId);
    if (!endpoint) {
      return NextResponse.json({ success: false, error: "Endpoint nao encontrado" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: endpoint });
  } catch (error) {
    return toErrorResponse(error, "Erro ao carregar endpoint");
  }
});

export const PATCH = withAuth(async (request, { params, actor }) => {
  try {
    const body = await request.json().catch(() => ({}));

    // Allowlist: impede escrita de campos arbitrarios no documento.
    const payload: EndpointUpdatePayload = {};
    if (typeof body?.title === "string") payload.title = body.title.trim();
    if (typeof body?.router === "string") payload.router = body.router.trim();
    if (typeof body?.fixedValuesEnabled === "boolean") payload.fixedValuesEnabled = body.fixedValuesEnabled;
    if (typeof body?.cacheTtlSeconds === "number") payload.cacheTtlSeconds = body.cacheTtlSeconds;
    if (body?.accessMode === "public" || body?.accessMode === "password") payload.accessMode = body.accessMode;
    if (typeof body?.accessPassword === "string" && body.accessPassword) {
      payload.accessPassword = body.accessPassword;
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ success: false, error: "Nada para atualizar" }, { status: 400 });
    }

    const summary = typeof body?.summary === "string" ? body.summary : undefined;
    return NextResponse.json(
      await endpointService.updateEndpoint(params.endpointId, payload, actor, summary),
    );
  } catch (error) {
    return toErrorResponse(error, "Erro ao salvar configuracoes");
  }
}, { require: "write" });

export const DELETE = withAuth(async (_request, { params, actor }) => {
  try {
    return NextResponse.json(await endpointService.deleteEndpoint(params.endpointId, actor));
  } catch (error) {
    return toErrorResponse(error, "Erro ao deletar o endpoint");
  }
}, { require: "delete" });
