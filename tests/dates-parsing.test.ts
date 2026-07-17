import { describe, expect, it } from "vitest";
import { normalizeDate, normalizeTime } from "@/lib/dates";

describe("date and time normalization", () => {
  it("normalizes workbook-like values", () => {
    expect(normalizeDate(new Date("2026-02-27T00:00:00"))).toBe("2026-02-27");
    expect(normalizeDate("2026-03-04")).toBe("2026-03-04");
    expect(normalizeTime("7:36:00 PM")).toBe("07:36");
  });
});
