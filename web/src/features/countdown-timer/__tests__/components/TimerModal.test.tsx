import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

const mocks = vi.hoisted(() => ({
  modalRef: { current: null as HTMLDialogElement | null },
  previousSessionType: "Focus",
  elapsedTimeInSeconds: 90,
}));

vi.mock("@/features/countdown-timer/hooks/useCountdownContext", () => ({
  default: () => ({
    modalRef: mocks.modalRef,
  }),
}));

vi.mock("@/features/countdown-timer/stores/session-store", () => ({
  usePreviousSessionType: () => mocks.previousSessionType,
}));

vi.mock("@/features/countdown-timer/stores/countdown-store", () => ({
  useElapsedTimeInSeconds: () => mocks.elapsedTimeInSeconds,
}));

import TimerModal from "@/features/countdown-timer/components/TimerModal";

describe("TimerModal", () => {
  beforeEach(() => {
    mocks.previousSessionType = "Focus";
    mocks.elapsedTimeInSeconds = 90;
    mocks.modalRef.current = null;
  });

  it("should render the modal dialog element", () => {
    render(<TimerModal />);

    const dialog = document.querySelector("dialog");
    expect(dialog).toBeInTheDocument();
  });

  it("should display the previous session type in the header", () => {
    mocks.previousSessionType = "Short Break";

    render(<TimerModal />);

    expect(screen.getByText("Short Break")).toBeInTheDocument();
  });

  it("should display the session ended message", () => {
    render(<TimerModal />);

    expect(screen.getByText(/Session has ended/)).toBeInTheDocument();
  });

  it("should display the 'went over by' message", () => {
    render(<TimerModal />);

    expect(screen.getByText(/You went over by/)).toBeInTheDocument();
  });

  it("should display Long Break session type", () => {
    mocks.previousSessionType = "Long Break";

    render(<TimerModal />);

    expect(screen.getByText("Long Break")).toBeInTheDocument();
  });

  it("should display Custom session type", () => {
    mocks.previousSessionType = "Custom";

    render(<TimerModal />);

    expect(screen.getByText("Custom")).toBeInTheDocument();
  });

  it("should render a close button", () => {
    render(<TimerModal />);

    const closeButton = screen.getByText("Close");
    expect(closeButton).toBeInTheDocument();
  });
});
