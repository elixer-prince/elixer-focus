import {
  formatElapsedTime,
  formatTimeInMinutesAndSeconds,
} from "@/utils/formatting";
import { describe, expect, it } from "vitest";

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

  it("should return the string 00:30 when given 30", () => {
    expect(formatTimeInMinutesAndSeconds(30)).toBe("00:30");
  });

  it("should return the string 02:45 when given 165", () => {
    expect(formatTimeInMinutesAndSeconds(165)).toBe("02:45");
  });

  it("should handle large values correctly", () => {
    expect(formatTimeInMinutesAndSeconds(3661)).toBe("61:01");
  });
});

describe("formatElapsedTime", () => {
  it("should return seconds only for values under 60", () => {
    expect(formatElapsedTime(0)).toBe("0 seconds");
    expect(formatElapsedTime(1)).toBe("1 second");
    expect(formatElapsedTime(30)).toBe("30 seconds");
  });

  it("should return minutes and seconds for values under 60 minutes", () => {
    expect(formatElapsedTime(60)).toBe("1 minute");
    expect(formatElapsedTime(90)).toBe("1 minute and 30 seconds");
    expect(formatElapsedTime(120)).toBe("2 minutes");
    expect(formatElapsedTime(185)).toBe("3 minutes and 5 seconds");
  });

  it("should return 1 hour when given 3600 seconds", () => {
    expect(formatElapsedTime(3600)).toBe("1 hour");
  });

  it("should return 1 hour and minutes when over 1 hour", () => {
    expect(formatElapsedTime(3900)).toBe("1 hour and 5 minutes");
    expect(formatElapsedTime(3660)).toBe("1 hour and 1 minute");
    expect(formatElapsedTime(4500)).toBe("1 hour and 15 minutes");
  });

  it("should return multiple hours", () => {
    expect(formatElapsedTime(7200)).toBe("2 hours");
    expect(formatElapsedTime(7500)).toBe("2 hours and 5 minutes");
    expect(formatElapsedTime(7260)).toBe("2 hours and 1 minute");
    expect(formatElapsedTime(10800)).toBe("3 hours");
  });

  it("should handle 85 minutes as 1 hour and 25 minutes", () => {
    expect(formatElapsedTime(5100)).toBe("1 hour and 25 minutes");
  });

  it("should handle the boundary at 59 seconds", () => {
    expect(formatElapsedTime(59)).toBe("59 seconds");
  });

  it("should handle the boundary at 59 minutes and 59 seconds", () => {
    expect(formatElapsedTime(3599)).toBe("59 minutes and 59 seconds");
  });

  it("should handle 2 hours and 1 minute", () => {
    expect(formatElapsedTime(7260)).toBe("2 hours and 1 minute");
  });

  it("should handle very large values", () => {
    expect(formatElapsedTime(86400)).toBe("24 hours");
  });
});
