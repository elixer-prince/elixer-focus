import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

const mocks = vi.hoisted(() => ({
  useCurrentSessionCount: vi.fn(() => 3),
  useSessionCountLimit: vi.fn(() => 6),
  useResetCurrentSessionCount: vi.fn(() => vi.fn()),
  useHandleCountdownState: vi.fn(() => ({ isEndingSoon: false })),
}));

vi.mock("@/features/countdown-timer/stores/session-store", () => ({
  useCurrentSessionCount: mocks.useCurrentSessionCount,
  useSessionCountLimit: mocks.useSessionCountLimit,
  useResetCurrentSessionCount: mocks.useResetCurrentSessionCount,
}));

vi.mock("@/features/countdown-timer/hooks/useHandleCountdownState", () => ({
  default: mocks.useHandleCountdownState,
}));

import SessionCount from "@/features/countdown-timer/components/TimerDisplay/SessionCount";

describe("SessionCount", () => {
  it("shows progress against the saved session count limit", () => {
    render(<SessionCount />);

    expect(screen.getByRole("button")).toHaveTextContent("3/6");
  });
});
