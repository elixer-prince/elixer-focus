import {
  timerHasEnded,
  timerIsAboutToEnd,
} from "@/features/countdown-timer/utils/checks";

describe("timerIsAboutToEnd", () => {
  it("should be true when the argument is greater than 10 but less than 0", () => {
    expect(timerIsAboutToEnd(10)).toBeTruthy();
    expect(timerIsAboutToEnd(4)).toBeTruthy();
  });

  it("should be false when the argument is less than or equal to 0", () => {
    expect(timerIsAboutToEnd(0)).toBeFalsy();
    expect(timerIsAboutToEnd(-1)).toBeFalsy();
  });

  it("should be false when the argument is greater than 10", () => {
    expect(timerIsAboutToEnd(11)).toBeFalsy();
    expect(timerIsAboutToEnd(54)).toBeFalsy();
  });
});

describe("timerHasEnded", () => {
  it("should be true when the argument is less than or equal to 0", () => {
    expect(timerHasEnded(0)).toBeTruthy();
    expect(timerHasEnded(-5)).toBeTruthy();
  });

  it("should be false when the argument is greater than 0", () => {
    expect(timerHasEnded(10)).toBeFalsy();
    expect(timerHasEnded(3)).toBeFalsy();
  });
});
