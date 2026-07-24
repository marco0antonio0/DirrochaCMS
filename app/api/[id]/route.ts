import { NextRequest } from "next/server";
import { endpointController } from "@/backend/endpoint/endpoint.controller";
import { runApiHandler } from "@/backend/common/next-route-adapter";

const handler = (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  return runApiHandler(request, context, endpointController.handlePublicEndpoint);
};

export const GET = handler;
export const OPTIONS = handler;
export const PATCH = handler;
export const DELETE = handler;
export const POST = handler;
export const PUT = handler;
