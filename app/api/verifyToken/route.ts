import { goneRoute } from "@/backend/common/goneRoute";

const handler = goneRoute("GET /api/admin/auth/me");

export const GET = handler;
export const POST = handler;
