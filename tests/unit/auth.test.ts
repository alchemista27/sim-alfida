import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";

describe("Auth Validation Schemas", () => {
  it("validates login input correctly", () => {
    const valid = loginSchema.safeParse({
      email: "user@alfida.sch.id",
      password: "Password123!",
    });
    expect(valid.success).toBe(true);

    const invalidEmail = loginSchema.safeParse({
      email: "invalid-email",
      password: "Password123!",
    });
    expect(invalidEmail.success).toBe(false);
  });

  it("validates register input with password strength & confirmation match", () => {
    const valid = registerSchema.safeParse({
      fullName: "Ahmad Fauzi",
      email: "ahmad@gmail.com",
      phone: "081234567890",
      password: "Password123!",
      confirmPassword: "Password123!",
    });
    expect(valid.success).toBe(true);

    const mismatch = registerSchema.safeParse({
      fullName: "Ahmad Fauzi",
      email: "ahmad@gmail.com",
      phone: "081234567890",
      password: "Password123!",
      confirmPassword: "DifferentPassword123!",
    });
    expect(mismatch.success).toBe(false);
  });
});

describe("Rate Limiter", () => {
  it("throttles attempts after limit is reached", () => {
    const testIp = "192.168.1.100";
    resetRateLimit(testIp);

    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(testIp, 5, 60000).success).toBe(true);
    }

    expect(checkRateLimit(testIp, 5, 60000).success).toBe(false);
  });
});
