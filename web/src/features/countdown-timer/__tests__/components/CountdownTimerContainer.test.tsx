import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("@/features/countdown-timer/components/TimerHeader/Index", () => ({
  default: () => (
    <header data-testid="countdown-header">CountdownHeader</header>
  ),
}));

vi.mock("@/features/countdown-timer/components/TimerDisplay/Index", () => ({
  default: () => <div data-testid="countdown-display">CountdownDisplay</div>,
}));

vi.mock("@/features/countdown-timer/components/ButtonControls/Index", () => ({
  default: () => <div data-testid="button-controls">ButtonControls</div>,
}));

vi.mock("@/features/countdown-timer/components/NotificationStatus", () => ({
  default: () => (
    <div data-testid="notification-status">NotificationStatus</div>
  ),
}));

import CountdownTimerContainer from "@/features/countdown-timer/components/Index";

describe("CountdownTimerContainer", () => {
  it("should render all child components", () => {
    render(<CountdownTimerContainer />);

    expect(screen.getByTestId("countdown-header")).toBeInTheDocument();
    expect(screen.getByTestId("countdown-display")).toBeInTheDocument();
    expect(screen.getByTestId("button-controls")).toBeInTheDocument();
    expect(screen.getByTestId("notification-status")).toBeInTheDocument();
  });

  it("should render a section element as the container", () => {
    const { container } = render(<CountdownTimerContainer />);

    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute(
      "class",
      expect.stringContaining("timer-container"),
    );
  });

  it("should render child components in the correct order", () => {
    render(<CountdownTimerContainer />);

    const section = screen.getByTestId("countdown-header").closest("section");
    const children = section?.children;

    expect(children?.length).toBe(4);
  });
});
