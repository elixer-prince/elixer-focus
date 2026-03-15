import {
  timerHasEnded,
  timerIsAboutToEnd,
} from "@/features/countdown-timer/utils/checks";

describe("Countdown Timer Utility Checks", () => {
  describe("timerIsAboutToEnd", () => {
    it("should be true when remaining seconds is between 1 and 10 inclusive", () => {
      expect(timerIsAboutToEnd(10)).toBe(true);
      expect(timerIsAboutToEnd(1)).toBe(true);
      expect(timerIsAboutToEnd(7)).toBe(true);
    });

    it("should be false when remaining seconds is 0 or less", () => {
      expect(timerIsAboutToEnd(0)).toBe(false);
      expect(timerIsAboutToEnd(-3)).toBe(false);
    });

    it("should be false when remaining seconds is greater than 10", () => {
      expect(timerIsAboutToEnd(11)).toBe(false);
      expect(timerIsAboutToEnd(42)).toBe(false);
    });
  });

  describe("timerHasEnded", () => {
    it("should be true when remaining seconds is 0 or less", () => {
      expect(timerHasEnded(0)).toBe(true);
      expect(timerHasEnded(-1)).toBe(true);
    });

    it("should be false when remaining seconds is greater than 0", () => {
      expect(timerHasEnded(1)).toBe(false);
      expect(timerHasEnded(25)).toBe(false);
    });
  });
});
