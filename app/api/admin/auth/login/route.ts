import { NextResponse, type NextRequest } from "next/server";
import { authService } from "@/backend/auth/auth.service";
import { setSessionCookie } from "@/backend/common/serverAuth";
import { toErrorResponse } from "@/backend/common/apiError";
import { getClientIp } from "@/backend/common/rateLimit";
import { verifyCaptchaPayload } from "@/backend/captcha/altcha";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const identifier = typeof body?.email === "string" ? body.email : body?.name;
    await verifyCaptchaPayload(body?.altcha);

    const result = await authService.login(identifier, body?.password, {
      ip: getClientIp(request),
    });

    const response = NextResponse.json({
      success: true,
      user: result.user,
      migratedTo: result.migratedTo,
    });

    return setSessionCookie(response, result.token);
  } catch (error) {
    return toErrorResponse(error, "Erro ao autenticar");
  }
}
