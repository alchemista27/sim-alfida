import { describe, it, expect } from "vitest";
import { PpdbFsm } from "@/lib/ppdb-fsm";
import { RegistrationStatus } from "@prisma/client";

describe("PPDB State Machine", () => {
  it("should allow transition from pending_payment to payment_uploaded", () => {
    expect(PpdbFsm.canTransition(RegistrationStatus.pending_payment, RegistrationStatus.payment_uploaded)).toBe(true);
  });

  it("should block transition from pending_payment to payment_verified directly", () => {
    expect(PpdbFsm.canTransition(RegistrationStatus.pending_payment, RegistrationStatus.payment_verified)).toBe(false);
  });

  it("should allow transition from payment_uploaded to pending_payment (rejection)", () => {
    expect(PpdbFsm.canTransition(RegistrationStatus.payment_uploaded, RegistrationStatus.pending_payment)).toBe(true);
  });

  it("should allow transition from payment_uploaded to payment_verified (approval)", () => {
    expect(PpdbFsm.canTransition(RegistrationStatus.payment_uploaded, RegistrationStatus.payment_verified)).toBe(true);
  });

  it("should not allow transition from accepted to pending_payment", () => {
    expect(PpdbFsm.canTransition(RegistrationStatus.accepted, RegistrationStatus.pending_payment)).toBe(false);
  });
});
