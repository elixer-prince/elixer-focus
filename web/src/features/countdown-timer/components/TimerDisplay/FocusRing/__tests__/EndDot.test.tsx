import { render } from "@testing-library/react";
import { vi } from "vitest";

const mockUseFocusRing = vi.fn();
vi.mock("@/features/countdown-timer/hooks/useFocusRing", () => ({
  __esModule: true,
  default: () => mockUseFocusRing(),
}));

import EndDot from "@/features/countdown-timer/components/TimerDisplay/FocusRing/EndDot";

const defaultFocusRing = {
  radius: 150,
  angleDeg: 0,
  CENTER: 172,
};

describe("EndDot", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFocusRing.mockReturnValue(defaultFocusRing);
  });

  describe("when not pulsing", () => {
    it("should render a circle element", () => {
      const { container } = render(<EndDot isPulsing={false} />);

      const circle = container.querySelector("circle");
      expect(circle).toBeInTheDocument();
    });

    it("should apply static drop-shadow filter", () => {
      const { container } = render(<EndDot isPulsing={false} />);

      const circle = container.querySelector("circle");
      expect(circle).toHaveStyle(
        "filter: drop-shadow(0 0 0.25rem currentColor)",
      );
    });

    it("should not have the focus-ring-pulse class", () => {
      const { container } = render(<EndDot isPulsing={false} />);

      const circle = container.querySelector("circle");
      const classes = circle?.getAttribute("class") || "";
      expect(classes).not.toContain("focus-ring-pulse");
    });

    it("should apply fill-primary class", () => {
      const { container } = render(<EndDot isPulsing={false} />);

      const circle = container.querySelector("circle");
      const classes = circle?.getAttribute("class") || "";
      expect(classes).toContain("fill-primary");
    });

    it("should position the dot at the correct location", () => {
      const { container } = render(<EndDot isPulsing={false} />);

      const circle = container.querySelector("circle");
      // cx = CENTER + radius = 172 + 150 = 322
      expect(circle).toHaveAttribute("cx", "322");
      expect(circle).toHaveAttribute("cy", "172");
      expect(circle).toHaveAttribute("r", "12");
    });

    it("should apply rotation transform from hook", () => {
      const { container } = render(<EndDot isPulsing={false} />);

      const circle = container.querySelector("circle");
      expect(circle).toHaveStyle("transform: rotate(0deg)");
    });
  });

  describe("when pulsing", () => {
    it("should apply the focus-ring-pulse class", () => {
      const { container } = render(<EndDot isPulsing={true} />);

      const circle = container.querySelector("circle");
      const classes = circle?.getAttribute("class") || "";
      expect(classes).toContain("focus-ring-pulse");
    });

    it("should not apply inline static filter", () => {
      const { container } = render(<EndDot isPulsing={true} />);

      const circle = container.querySelector("circle");
      expect(circle).not.toHaveStyle(
        "filter: drop-shadow(0px 0px 0.25rem currentColor)",
      );
    });
  });

  describe("with different angle values", () => {
    it("should update rotation when angleDeg changes", () => {
      mockUseFocusRing.mockReturnValue({
        ...defaultFocusRing,
        angleDeg: -180,
      });

      const { container } = render(<EndDot isPulsing={false} />);

      const circle = container.querySelector("circle");
      expect(circle).toHaveStyle("transform: rotate(-180deg)");
    });
  });
});
