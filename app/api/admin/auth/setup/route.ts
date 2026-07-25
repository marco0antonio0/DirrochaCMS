import { NextResponse, type NextRequest } from "next/server";
import { authService } from "@/backend/auth/auth.service";
import { setSessionCookie } from "@/backend/common/serverAuth";
import { toErrorResponse } from "@/backend/common/apiError";
import { verifyCaptchaPayload } from "@/backend/captcha/altcha";

/** Estado de configuracao do painel; substitui a leitura direta de `users/default` no browser. */
export async function GET() {
  try {
    return NextResponse.json({ success: true, ...(await authService.getSetupState()) });
  } catch (error) {
    return toErrorResponse(error, "Erro ao verificar a configuracao");
  }
}

/** Cria a primeira conta. Recusa se o painel ja estiver configurado. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    await verifyCaptchaPayload(body?.altcha);
    const result = await authService.bootstrapFirstAdmin({
      name: body?.name,
      email: typeof body?.email === "string" ? body.email : body?.name,
      password: body?.password,
    });

    const response = NextResponse.json({ success: true, user: result.user }, { status: 201 });
    return setSessionCookie(response, result.token);
  } catch (error) {
    return toErrorResponse(error, "Erro ao criar a primeira conta");
  }
}
