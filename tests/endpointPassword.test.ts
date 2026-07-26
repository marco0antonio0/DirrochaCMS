import { beforeAll, describe, expect, it } from "vitest";
import {
  hashEndpointPassword,
  verifyEndpointPassword,
} from "@/backend/endpoint/endpointPassword";

describe("endpoint password hashing", () => {
  beforeAll(() => {
    process.env.SECRET_KEY = "test_secret_key_for_endpoint_passwords_0123456789";
  });

  it("hashes endpoint passwords without storing the plain secret", () => {
    const hash = hashEndpointPassword("senha-segura");

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).not.toBe("senha-segura");
  });

  it("verifies hashed and legacy endpoint passwords", () => {
    const hash = hashEndpointPassword("senha-segura");

    expect(verifyEndpointPassword("senha-segura", { accessPasswordHash: hash })).toBe(true);
    expect(verifyEndpointPassword("senha-errada", { accessPasswordHash: hash })).toBe(false);
    expect(verifyEndpointPassword("legada", { accessPassword: "legada" })).toBe(true);
  });

  it("rejects empty or missing endpoint passwords", () => {
    expect(verifyEndpointPassword("", { accessPassword: "segredo" })).toBe(false);
    expect(verifyEndpointPassword("segredo", {})).toBe(false);
  });
});
