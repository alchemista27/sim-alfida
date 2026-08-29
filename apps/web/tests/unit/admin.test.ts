import { describe, it, expect } from "vitest";
import { unitSchema, assignAdminSchema } from "@/lib/validations/admin";

describe("Unit schema validation", () => {
  it("should accept a valid unit input", () => {
    const result = unitSchema.safeParse({
      name: "TK Islam Terpadu Auladuna 3",
      slug: "tk-auladuna-3",
      level: "tk",
      isActive: true,
    });
    expect(result.success).toBe(true);
  });

  it("should reject a slug with spaces or uppercase", () => {
    const result = unitSchema.safeParse({
      name: "SD Baru",
      slug: "SD Baru Bagus",
      level: "sd",
      isActive: true,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/slug/i);
    }
  });

  it("should reject a name shorter than 3 characters", () => {
    const result = unitSchema.safeParse({
      name: "TK",
      slug: "tk",
      level: "tk",
      isActive: true,
    });
    expect(result.success).toBe(false);
  });

  it("should reject an invalid level enum", () => {
    const result = unitSchema.safeParse({
      name: "Universitas Alfida",
      slug: "univ-alfida",
      level: "universitas",
      isActive: true,
    });
    expect(result.success).toBe(false);
  });
});

describe("Assign Admin schema validation", () => {
  it("should accept valid UUIDs", () => {
    const result = assignAdminSchema.safeParse({
      userId: "123e4567-e89b-12d3-a456-426614174000",
      unitId: "987fcdeb-51a2-43d7-b123-5e4e9f6a7b8c",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid UUIDs", () => {
    const result = assignAdminSchema.safeParse({
      userId: "not-a-uuid",
      unitId: "also-not-a-uuid",
    });
    expect(result.success).toBe(false);
  });
});

describe("Slug auto-generation logic", () => {
  it("should correctly convert name to slug", () => {
    const name = "TK Islam Terpadu Auladuna 1";
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    expect(slug).toBe("tk-islam-terpadu-auladuna-1");
  });

  it("should remove leading and trailing hyphens", () => {
    const name = "  SD Baru  ";
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    expect(slug).toBe("sd-baru");
  });
});
