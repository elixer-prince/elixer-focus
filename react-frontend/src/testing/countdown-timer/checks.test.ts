import {
  timerHasEnded,
  timerIsAboutToEnd,
} from "@/utils/countdown-timer/checks";
import { describe, expect, it } from "vitest";

describe("timerIsAboutToEnd", () => {
  it("should be true when the argument is <= 10 but > 0", () => {
    expect(timerIsAboutToEnd(10)).toBeTruthy();
    expect(timerIsAboutToEnd(4)).toBeTruthy();
  });

  it("should be false when the argument is <= 0", () => {
    expect(timerIsAboutToEnd(0)).toBeFalsy();
    expect(timerIsAboutToEnd(-1)).toBeFalsy();
  });

  it("should be false when the argument is > 10", () => {
    expect(timerIsAboutToEnd(11)).toBeFalsy();
    expect(timerIsAboutToEnd(54)).toBeFalsy();
  });
});

describe("timerHasEnded", () => {
  it("should be true when the argument is <= 0", () => {
    expect(timerHasEnded(0)).toBeTruthy();
    expect(timerHasEnded(-5)).toBeTruthy();
  });

  it("should be false when the argument is > 0", () => {
    expect(timerHasEnded(10)).toBeFalsy();
    expect(timerHasEnded(3)).toBeFalsy();
  });
});
