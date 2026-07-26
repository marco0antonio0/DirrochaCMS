import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { handlePublicEndpoint } from "@/backend/endpoint/endpoint.controller";
import { endpointRepository } from "@/backend/endpoint/endpoint.repository";
import { itemService } from "@/backend/item/item.service";
import { consumeRateLimit } from "@/backend/common/rateLimit";

vi.mock("@/backend/endpoint/endpoint.repository", () => ({
  endpointRepository: {
    findByRouterWithSecret: vi.fn(),
  },
}));

vi.mock("@/backend/item/item.service", () => ({
  itemService: {
    getItems: vi.fn(),
  },
}));

vi.mock("@/backend/common/rateLimit", () => ({
  consumeRateLimit: vi.fn(),
  getClientIp: vi.fn(() => "127.0.0.1"),
}));

const context = { params: Promise.resolve({ id: "posts" }) };

describe("handlePublicEndpoint", () => {
  beforeEach(() => {
    vi.mocked(consumeRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 119,
      retryAfterSeconds: 0,
    });
    vi.mocked(endpointRepository.findByRouterWithSecret).mockResolvedValue({
      id: "endpoint-1",
      router: "posts",
      accessMode: "password",
      accessPassword: "segredo",
      fixedValuesEnabled: false,
      cacheTtlSeconds: 0,
    } as any);
  });

  it("does not accept endpoint passwords in the query string", async () => {
    const request = new NextRequest("http://localhost/api/posts?password=segredo");
    const response = await handlePublicEndpoint(request, context);

    expect(response.status).toBe(401);
    expect(itemService.getItems).not.toHaveBeenCalled();
  });

  it("accepts endpoint passwords only through the configured header", async () => {
    vi.mocked(itemService.getItems).mockResolvedValue({
      success: true,
      data: [
        {
          id: "item-1",
          formattedData: { titulo_identificador: "primeiro" },
          createdAt: "2026-01-01T00:00:00.000Z",
          createdBy: { id: "admin" },
          updatedBy: { id: "admin" },
        },
      ],
    } as any);

    const request = new NextRequest("http://localhost/api/posts", {
      headers: { "x-endpoint-password": "segredo" },
    });
    const response = await handlePublicEndpoint(request, context);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0]).not.toHaveProperty("createdBy");
    expect(body.data[0]).not.toHaveProperty("updatedBy");
  });
});
