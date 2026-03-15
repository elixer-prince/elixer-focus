import {
  calculateEndTime,
  calculateRemainingSeconds,
} from "@/features/countdown-timer/utils/calculations";
import { getCurrentTimestamp } from "@/utils/date";

vi.mock("@/utils/date", () => ({
  getCurrentTimestamp: vi.fn(),
}));

describe("Countdown Timer Utility Calculations", () => {
  const getCurrentTimestampMock = vi.mocked(getCurrentTimestamp);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("calculateEndTime", () => {
    it("should add remaining seconds (as milliseconds) to the current timestamp", () => {
      getCurrentTimestampMock.mockReturnValue(1_000_000);

      const endTime = calculateEndTime(75);

      expect(getCurrentTimestampMock).toHaveBeenCalledTimes(1);
      expect(endTime).toBe(1_075_000);
    });
  });

  describe("calculateRemainingSeconds", () => {
    it("should round to the nearest second", () => {
      const now = 1_000;
      const endTime = 3_500;

      expect(calculateRemainingSeconds(now, endTime)).toBe(3);
    });

    it("should never return a negative value", () => {
      const now = 5_000;
      const endTime = 4_000;

      expect(calculateRemainingSeconds(now, endTime)).toBe(0);
    });
  });
});
