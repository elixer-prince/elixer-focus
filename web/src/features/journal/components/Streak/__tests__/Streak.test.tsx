import { afterEach, describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";

import StreakCounter from "@/features/journal/components/Streak/Index";

const mockGetStreak = vi.fn(() => 0);

vi.mock("@/features/journal/stores/journal-store", () => ({
  useGetStreak: () => mockGetStreak,
}));

vi.mock("react-icons/md", () => ({
  MdLocalFireDepartment: () => <span data-testid="fire-icon">🔥</span>,
}));

afterEach(() => {
  vi.clearAllMocks();
  mockGetStreak.mockReturnValue(0);
});

describe("StreakCounter component", () => {
  it("shows start message when streak is 0", () => {
    render(<StreakCounter />);

    expect(
      screen.getByText("Start your first session to build a streak!"),
    ).toBeInTheDocument();
  });

  it("shows streak count and label when streak is greater than 0", () => {
    mockGetStreak.mockReturnValue(5);

    render(<StreakCounter />);

    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("days streak")).toBeInTheDocument();
  });

  it("shows singular 'day' when streak is 1", () => {
    mockGetStreak.mockReturnValue(1);

    render(<StreakCounter />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("day streak")).toBeInTheDocument();
  });
});
