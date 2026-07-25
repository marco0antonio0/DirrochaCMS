import { NextResponse } from "next/server";
import { authService } from "@/backend/auth/auth.service";
import { clearSessionCookie, withAuth } from "@/backend/common/serverAuth";
import { toErrorResponse } from "@/backend/common/apiError";

export const POST = withAuth(async (_request, { sid }) => {
  try {
    await authService.logout(sid);
    return clearSessionCookie(NextResponse.json({ success: true }));
  } catch (error) {
    return toErrorResponse(error, "Erro ao encerrar a sessao");
  }
});
