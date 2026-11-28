import {
  convertMillisecondsToSeconds,
  convertMinutesToMilliseconds,
  convertMinutesToSeconds,
  convertSecondsToMilliseconds,
  convertSecondsToMinutes,
  getCurrentTimestamp,
} from "@elixer-focus/shared/utils";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("shared timestamp and duration utilities", () => {
  it("returns epoch milliseconds from Date.now", () => {
    vi.spyOn(Date, "now").mockReturnValue(123456);
    expect(getCurrentTimestamp()).toBe(123456);
  });

  it("converts between minutes, seconds, and milliseconds", () => {
    expect(convertMinutesToSeconds(2)).toBe(120);
    expect(convertMinutesToMilliseconds(2)).toBe(120000);
    expect(convertSecondsToMinutes(120)).toBe(2);
    expect(convertSecondsToMilliseconds(2)).toBe(2000);
    expect(convertMillisecondsToSeconds(2000)).toBe(2);
  });
});
