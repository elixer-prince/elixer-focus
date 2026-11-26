import {
  formatLocalDate,
  getLocalDayRange,
  isValidLocalDate,
  parseLocalDate,
} from "@/features/calendar/utils/calendar-date";

describe("calendar date helpers", () => {
  it("accepts real local calendar dates and rejects impossible dates", () => {
    expect(isValidLocalDate("2024-02-29")).toBe(true);
    expect(isValidLocalDate("2025-02-29")).toBe(false);
    expect(isValidLocalDate("2025-13-01")).toBe(false);
  });

  it("moves to the next local calendar date rather than adding a fixed day length", () => {
    const { start, end } = getLocalDayRange("2026-03-08");

    expect(formatLocalDate(start)).toBe("2026-03-08");
    expect(formatLocalDate(end)).toBe("2026-03-09");
    expect(formatLocalDate(parseLocalDate("2026-03-08"))).toBe("2026-03-08");
  });
});
