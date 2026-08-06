import { describe, it, expect } from "vitest";
import { unitSettingsSchema, academicYearSchema } from "@/lib/validations/unit";

describe("Unit Settings Schema", () => {
  it("should accept valid principal name", () => {
    const result = unitSettingsSchema.safeParse({
      principalName: "Ibu Nur Hidayah, S.Pd.",
      principalNip: "",
    });
    expect(result.success).toBe(true);
  });

  it("should reject short principal name", () => {
    const result = unitSettingsSchema.safeParse({
      principalName: "Ab",
    });
    expect(result.success).toBe(false);
  });

  it("should reject NIP with wrong length (not 18 digits)", () => {
    const result = unitSettingsSchema.safeParse({
      principalName: "Valid Name",
      principalNip: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("should accept empty NIP", () => {
    const result = unitSettingsSchema.safeParse({
      principalName: "Valid Name",
      principalNip: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("Academic Year Schema", () => {
  it("should accept valid academic year input", () => {
    const result = academicYearSchema.safeParse({
      name: "2027/2028",
      startDate: "2027-01-01",
      endDate: "2027-06-30",
      quota: 30,
      ppdbActive: false,
    });
    expect(result.success).toBe(true);
  });

  it("should reject quota of 0", () => {
    const result = academicYearSchema.safeParse({
      name: "2027/2028",
      startDate: "2027-01-01",
      endDate: "2027-06-30",
      quota: 0,
      ppdbActive: false,
    });
    expect(result.success).toBe(false);
  });

  it("should reject quota above 500", () => {
    const result = academicYearSchema.safeParse({
      name: "2027/2028",
      startDate: "2027-01-01",
      endDate: "2027-06-30",
      quota: 501,
      ppdbActive: false,
    });
    expect(result.success).toBe(false);
  });

  it("should reject empty name", () => {
    const result = academicYearSchema.safeParse({
      name: "",
      startDate: "2027-01-01",
      endDate: "2027-06-30",
      quota: 30,
      ppdbActive: false,
    });
    expect(result.success).toBe(false);
  });
});
