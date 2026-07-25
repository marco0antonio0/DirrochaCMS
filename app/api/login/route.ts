import { goneRoute } from "@/backend/common/goneRoute";

const handler = goneRoute("POST /api/admin/auth/login");

export const GET = handler;
export const POST = handler;
