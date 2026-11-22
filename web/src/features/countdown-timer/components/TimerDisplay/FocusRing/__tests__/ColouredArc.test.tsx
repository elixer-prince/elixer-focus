import { render } from "@testing-library/react";
import { vi } from "vitest";

const mockUseFocusRing = vi.fn();
vi.mock("@/features/countdown-timer/hooks/useFocusRing", () => ({
  __esModule: true,
  default: () => mockUseFocusRing(),
}));

import ColouredArc from "@/features/countdown-timer/components/TimerDisplay/FocusRing/ColouredArc";

const defaultFocusRing = {
  radius: 150,
  dashoffset: 0,
  circumference: 942,
  CENTER: 172,
};

describe("ColouredArc", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFocusRing.mockReturnValue(defaultFocusRing);
  });

  describe("when not pulsing", () => {
    it("should render a circle element", () => {
      const { container } = render(<ColouredArc isPulsing={false} />);

      const circle = container.querySelector("circle");
      expect(circle).toBeInTheDocument();
    });

    it("should apply static drop-shadow filter", () => {
      const { container } = render(<ColouredArc isPulsing={false} />);

      const circle = container.querySelector("circle");
      expect(circle).toHaveStyle(
        "filter: drop-shadow(0 0 0.25rem currentColor)",
      );
    });

    it("should not have the focus-ring-pulse class", () => {
      const { container } = render(<ColouredArc isPulsing={false} />);

      const circle = container.querySelector("circle");
      const classes = circle?.getAttribute("class") || "";
      expect(classes).not.toContain("focus-ring-pulse");
    });

    it("should apply stroke-primary and stroke-8 classes", () => {
      const { container } = render(<ColouredArc isPulsing={false} />);

      const circle = container.querySelector("circle");
      const classes = circle?.getAttribute("class") || "";
      expect(classes).toContain("stroke-primary");
      expect(classes).toContain("stroke-8");
    });

    it("should set correct circle attributes from hook", () => {
      const { container } = render(<ColouredArc isPulsing={false} />);

      const circle = container.querySelector("circle");
      expect(circle).toHaveAttribute("cx", "172");
      expect(circle).toHaveAttribute("cy", "172");
      expect(circle).toHaveAttribute("r", "150");
    });
  });

  describe("when pulsing", () => {
    it("should apply the focus-ring-pulse class", () => {
      const { container } = render(<ColouredArc isPulsing={true} />);

      const circle = container.querySelector("circle");
      const classes = circle?.getAttribute("class") || "";
      expect(classes).toContain("focus-ring-pulse");
    });

    it("should not apply inline static filter", () => {
      const { container } = render(<ColouredArc isPulsing={true} />);

      const circle = container.querySelector("circle");
      expect(circle).not.toHaveStyle(
        "filter: drop-shadow(0px 0px 0.25rem currentColor)",
      );
    });
  });
});
