import { render } from "@testing-library/react";
import { vi } from "vitest";

const mockUseTimerRunning = vi.fn();
const mockUseTimerPaused = vi.fn();
vi.mock("@/features/countdown-timer/stores/countdown-store", () => ({
  useTimerRunning: () => mockUseTimerRunning(),
  useTimerPaused: () => mockUseTimerPaused(),
}));

vi.mock(
  "@/features/countdown-timer/components/TimerDisplay/FocusRing/BackgroundTrack",
  () => ({
    default: () => <circle data-testid="background-track" />,
  }),
);

vi.mock(
  "@/features/countdown-timer/components/TimerDisplay/FocusRing/ColouredArc",
  () => ({
    __esModule: true,
    default: ({ isPulsing }: { isPulsing: boolean }) => (
      <circle data-testid="coloured-arc" data-pulsing={isPulsing} />
    ),
  }),
);

vi.mock(
  "@/features/countdown-timer/components/TimerDisplay/FocusRing/EndDot",
  () => ({
    __esModule: true,
    default: ({ isPulsing }: { isPulsing: boolean }) => (
      <circle data-testid="end-dot" data-pulsing={isPulsing} />
    ),
  }),
);

import FocusRing from "@/features/countdown-timer/components/TimerDisplay/FocusRing/Index";

describe("FocusRing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("pulse logic", () => {
    it("should not pulse when timer is stopped", () => {
      mockUseTimerRunning.mockReturnValue(false);
      mockUseTimerPaused.mockReturnValue(true);

      const { getByTestId } = render(<FocusRing />);

      expect(getByTestId("coloured-arc")).toHaveAttribute(
        "data-pulsing",
        "false",
      );
      expect(getByTestId("end-dot")).toHaveAttribute("data-pulsing", "false");
    });

    it("should not pulse when timer is paused", () => {
      mockUseTimerRunning.mockReturnValue(true);
      mockUseTimerPaused.mockReturnValue(true);

      const { getByTestId } = render(<FocusRing />);

      expect(getByTestId("coloured-arc")).toHaveAttribute(
        "data-pulsing",
        "false",
      );
      expect(getByTestId("end-dot")).toHaveAttribute("data-pulsing", "false");
    });

    it("should pulse when timer is running and not paused", () => {
      mockUseTimerRunning.mockReturnValue(true);
      mockUseTimerPaused.mockReturnValue(false);

      const { getByTestId } = render(<FocusRing />);

      expect(getByTestId("coloured-arc")).toHaveAttribute(
        "data-pulsing",
        "true",
      );
      expect(getByTestId("end-dot")).toHaveAttribute("data-pulsing", "true");
    });
  });

  describe("structure", () => {
    beforeEach(() => {
      mockUseTimerRunning.mockReturnValue(false);
      mockUseTimerPaused.mockReturnValue(true);
    });

    it("should render an SVG with correct viewBox", () => {
      const { container } = render(<FocusRing />);

      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("viewBox", "0 0 344 344");
    });

    it("should render all three ring elements", () => {
      const { getByTestId } = render(<FocusRing />);

      expect(getByTestId("background-track")).toBeInTheDocument();
      expect(getByTestId("coloured-arc")).toBeInTheDocument();
      expect(getByTestId("end-dot")).toBeInTheDocument();
    });

    it("should apply focus-ring class to the SVG", () => {
      const { container } = render(<FocusRing />);

      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute(
        "class",
        expect.stringContaining("focus-ring"),
      );
    });
  });
});
