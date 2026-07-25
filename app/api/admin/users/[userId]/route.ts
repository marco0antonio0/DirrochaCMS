import { NextResponse } from "next/server";
import { userService } from "@/backend/user/user.service";
import { withAuth } from "@/backend/common/serverAuth";
import { toErrorResponse } from "@/backend/common/apiError";
import { isUserRole } from "@/backend/user/user.entity";
import type { UserUpdatePayload } from "@/backend/user/user.model";

const REQUIRE_MANAGEMENT = { require: "manageUsers" } as const;

export const PATCH = withAuth(async (request, { params, actor }) => {
  try {
    const body = await request.json().catch(() => ({}));

    // Allowlist explicita: impede que o cliente escreva campos arbitrarios no documento.
    const payload: UserUpdatePayload = {};
    if (typeof body?.name === "string") payload.name = body.name.trim();
    if (typeof body?.email === "string") payload.email = body.email;
    if (typeof body?.password === "string" && body.password) payload.password = body.password;
    if (typeof body?.disabled === "boolean") payload.disabled = body.disabled;
    if (isUserRole(body?.role)) payload.role = body.role;

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ success: false, error: "Nada para atualizar" }, { status: 400 });
    }

    return NextResponse.json(await userService.updateUser(params.userId, payload, actor));
  } catch (error) {
    return toErrorResponse(error, "Erro ao salvar usuario");
  }
}, REQUIRE_MANAGEMENT);

export const DELETE = withAuth(async (_request, { params, actor }) => {
  try {
    return NextResponse.json(await userService.deleteUserById(params.userId, actor));
  } catch (error) {
    return toErrorResponse(error, "Erro ao excluir usuario");
  }
}, REQUIRE_MANAGEMENT);
