import { describe, expect, it } from "vitest";
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  validatePassword,
} from "@/backend/common/passwordPolicy";

describe("validatePassword", () => {
  it("rejects missing and short passwords", () => {
    expect(validatePassword(undefined).ok).toBe(false);
    expect(validatePassword("curta").error).toContain(String(MIN_PASSWORD_LENGTH));
  });

  it("rejects obvious common passwords and repeated characters", () => {
    expect(validatePassword("senha123456").ok).toBe(false);
    expect(validatePassword("aaaaaaaaaa").ok).toBe(false);
    expect(validatePassword("ababababab").ok).toBe(false);
  });

  it("accepts a long password with enough character variety", () => {
    expect(validatePassword("Frase longa 2026 cms").ok).toBe(true);
  });

  it("rejects passwords above the configured maximum length", () => {
    expect(validatePassword("a".repeat(MAX_PASSWORD_LENGTH + 1)).ok).toBe(false);
  });
});
