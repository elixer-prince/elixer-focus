import { afterEach, describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";

import FocusTimeChart from "@/features/journal/components/Chart/Index";

const themeColors = vi.hoisted(() => ({
  primary: "rgb(245, 190, 30)",
  secondary: "rgb(40, 190, 210)",
  content: "rgb(245, 245, 245)",
}));

vi.mock("@/features/countdown-timer/stores/session-history-store", () => ({
  getTotalFocusTime: vi.fn(() => 0),
  useGetTotalFocusTimeForRanges: vi.fn(() => [0, 0, 0, 0, 0, 0, 0]),
  useSessions: vi.fn(() => []),
  useTrackedIntervals: vi.fn(() => []),
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
  Bar: ({
    data,
  }: {
    data: { datasets: { label: string; backgroundColor: string }[] };
  }) => (
    <div data-testid="chart-canvas">
      {data.datasets.map((dataset) => (
        <span key={dataset.label}>
          {dataset.label}: {dataset.backgroundColor}
        </span>
      ))}
    </div>
  ),
}));

beforeEach(() => {
  vi.spyOn(window, "getComputedStyle").mockImplementation(
    () =>
      ({
        getPropertyValue: (property: string) => {
          switch (property) {
            case "--color-primary":
              return themeColors.primary;
            case "--color-secondary":
              return themeColors.secondary;
            case "--color-base-content":
              return themeColors.content;
            default:
              return "";
          }
        },
      }) as CSSStyleDeclaration,
  );
});

afterEach(() => {
  vi.restoreAllMocks();
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
    expect(
      screen.getByText(`Focus Time: ${themeColors.primary}`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Idle Time: ${themeColors.secondary}`),
    ).toBeInTheDocument();
  });
});
