import { formatTimeInMinutesAndSeconds } from "@/utils/formatting";
import { it, expect, describe } from "vitest";

describe("formatTimeInMinutesAndSeconds", () => {
  it("should return the string 00:00 when given 0", () => {
    expect(formatTimeInMinutesAndSeconds(0)).toBe("00:00");
  });

  it("should return the string 01:00 when given 60", () => {
    expect(formatTimeInMinutesAndSeconds(60)).toBe("01:00");
  });

  it("should return the string -01:00 when given -60", () => {
    expect(formatTimeInMinutesAndSeconds(-60)).toBe("-01:00");
  });
});
