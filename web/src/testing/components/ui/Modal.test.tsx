import { render, screen } from "@testing-library/react";

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

import Modal from "@/components/ui/Modal";

describe("Modal", () => {
  beforeEach(() => {
    mocks.previousSessionType = "Focus";
    mocks.elapsedTimeInSeconds = 90;
  });

  it("should render the modal dialog element", () => {
    render(<Modal />);

    const dialog = document.querySelector("dialog");
    expect(dialog).toBeInTheDocument();
  });

  it("should display the previous session type in the header", () => {
    mocks.previousSessionType = "Short Break";

    render(<Modal />);

    expect(screen.getByText("Short Break")).toBeInTheDocument();
  });

  it("should display the formatted elapsed time for seconds and minutes", () => {
    mocks.elapsedTimeInSeconds = 90;

    render(<Modal />);

    expect(screen.getByText(/1 minute and 30 seconds/)).toBeInTheDocument();
  });

  it("should display the formatted elapsed time for hours and minutes", () => {
    mocks.elapsedTimeInSeconds = 5100;

    render(<Modal />);

    expect(screen.getByText(/1 hour and 25 minutes/)).toBeInTheDocument();
  });

  it("should display the formatted elapsed time for seconds only", () => {
    mocks.elapsedTimeInSeconds = 30;

    render(<Modal />);

    expect(screen.getByText(/30 seconds/)).toBeInTheDocument();
  });

  it("should display the 'went over by' message", () => {
    render(<Modal />);

    expect(screen.getByText(/You went over by/)).toBeInTheDocument();
  });

  it("should render a close button", () => {
    render(<Modal />);

    const closeButton = document.querySelector("button");
    expect(closeButton).toBeInTheDocument();
    expect(closeButton?.textContent).toBe("Close");
  });

  it("should display Long Break session type", () => {
    mocks.previousSessionType = "Long Break";

    render(<Modal />);

    expect(screen.getByText("Long Break")).toBeInTheDocument();
  });

  it("should display Custom session type", () => {
    mocks.previousSessionType = "Custom";

    render(<Modal />);

    expect(screen.getByText("Custom")).toBeInTheDocument();
  });
});
