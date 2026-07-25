import { NextResponse } from "next/server";
import { userService } from "@/backend/user/user.service";
import { withAuth } from "@/backend/common/serverAuth";
import { toErrorResponse } from "@/backend/common/apiError";

const REQUIRE_MANAGEMENT = { require: "manageUsers" } as const;

export const GET = withAuth(async () => {
  try {
    return NextResponse.json(await userService.listUsers());
  } catch (error) {
    return toErrorResponse(error, "Erro ao carregar usuarios");
  }
}, REQUIRE_MANAGEMENT);

export const POST = withAuth(async (request, { actor }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const result = await userService.createUser(
      {
        name: body?.name,
        email: body?.email,
        password: body?.password,
        role: body?.role,
      },
      actor,
    );
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "Erro ao criar usuario");
  }
}, REQUIRE_MANAGEMENT);
