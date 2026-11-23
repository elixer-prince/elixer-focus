import { afterEach, describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";

import FocusTimeChart from "@/features/journal/components/Chart/Index";

vi.mock("@/features/countdown-timer/stores/session-history-store", () => ({
  getTotalFocusTime: vi.fn(() => 0),
}));

vi.mock("@/utils/formatting", () => ({
  formatElapsedTime: vi.fn(() => "0s"),
}));

vi.mock("chart.js", () => ({
  Chart: { register: vi.fn() },
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}));

vi.mock("react-chartjs-2", () => ({
  Bar: () => <canvas data-testid="chart-canvas" />,
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("FocusTimeChart component", () => {
  it("renders the chart title", () => {
    render(<FocusTimeChart />);

    expect(screen.getByText("This Week")).toBeInTheDocument();
  });

  it("renders the chart canvas", () => {
    render(<FocusTimeChart />);

    expect(screen.getByTestId("chart-canvas")).toBeInTheDocument();
  });
});
