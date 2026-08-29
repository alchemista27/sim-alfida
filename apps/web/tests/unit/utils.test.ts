import { describe, it, expect } from "vitest";
import { cn, formatRupiah } from "@/lib/utils";

describe("Utils tests", () => {
  it("cn correctly merges tailwind classes", () => {
    expect(cn("px-2 py-1", "bg-tertiary", { "text-white": true })).toBe(
      "px-2 py-1 bg-tertiary text-white"
    );
  });

  it("formatRupiah formats numbers correctly", () => {
    expect(formatRupiah(150000)).toContain("150.000");
  });
});
