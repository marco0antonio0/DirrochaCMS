import { NextRequest } from "next/server";
import { authController } from "@/backend/auth/auth.controller";
import { runApiHandler } from "@/backend/common/next-route-adapter";

export const GET = (request: NextRequest) => {
  return runApiHandler(request, {}, authController.handleVerifyToken);
};
