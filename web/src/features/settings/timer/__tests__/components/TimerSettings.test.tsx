import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

// Mutable mock state for testing unsaved changes scenario
let mockDraftFocus = "25";
let mockDraftShortBreak = "5";
let mockDraftLongBreak = "15";
const mockSetDraftFocus = vi.fn();
const mockSetDraftShortBreak = vi.fn();
const mockSetDraftLongBreak = vi.fn();

vi.mock("@/features/settings/timer/hooks/useTimerSettingsContext", () => ({
  useTimerSettingsContext: () => ({
    draftFocus: mockDraftFocus,
    draftShortBreak: mockDraftShortBreak,
    draftLongBreak: mockDraftLongBreak,
    setDraftFocus: mockSetDraftFocus,
    setDraftShortBreak: mockSetDraftShortBreak,
    setDraftLongBreak: mockSetDraftLongBreak,
  }),
}));

let mockFocusDuration = 25;
let mockShortBreakDuration = 5;
let mockLongBreakDuration = 15;

vi.mock("@/features/countdown-timer/stores/session-store", () => ({
  useAttributeSessionOverrun: () => true,
  useFocusDuration: () => mockFocusDuration,
  useShortBreakDuration: () => mockShortBreakDuration,
  useLongBreakDuration: () => mockLongBreakDuration,
  useCurrentSessionType: () => "Focus",
  useSetFocusDuration: () => vi.fn(),
  useSetShortBreakDuration: () => vi.fn(),
  useSetLongBreakDuration: () => vi.fn(),
}));

vi.mock("@/features/countdown-timer/services/timer-coordinator", () => ({
  dispatchTimerCommand: vi.fn(),
}));

vi.mock("@/features/countdown-timer/stores/countdown-store", () => ({
  useTimerRunning: () => false,
  useTimerPaused: () => false,
  useSetStartTimeInMinutes: () => vi.fn(),
  useSetRemainingTimeInSeconds: () => vi.fn(),
}));

vi.mock("@/features/countdown-timer/hooks/useAutoSyncTimer", () => ({
  default: () => {},
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/features/settings/timer/FocusContainer", () => ({
  default: () => <div data-testid="focus-container">Focus Input</div>,
}));

vi.mock("@/features/settings/timer/ShortBreakContainer", () => ({
  default: () => (
    <div data-testid="short-break-container">Short Break Input</div>
  ),
}));

vi.mock("@/features/settings/timer/LongBreakContainer", () => ({
  default: () => <div data-testid="long-break-container">Long Break Input</div>,
}));

import TimerSettings from "@/features/settings/timer/Index";

describe("TimerSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDraftFocus = "25";
    mockDraftShortBreak = "5";
    mockDraftLongBreak = "15";
    mockFocusDuration = 25;
    mockShortBreakDuration = 5;
    mockLongBreakDuration = 15;
  });

  it("should render the page title", () => {
    render(<TimerSettings />);

    expect(screen.getByText("Timer Settings")).toBeInTheDocument();
  });

  it("should render the description text", () => {
    render(<TimerSettings />);

    expect(
      screen.getByText(/Configure the duration for each session type/i),
    ).toBeInTheDocument();
  });

  it("should render all three duration cards", () => {
    render(<TimerSettings />);

    expect(screen.getByTestId("focus-container")).toBeInTheDocument();
    expect(screen.getByTestId("short-break-container")).toBeInTheDocument();
    expect(screen.getByTestId("long-break-container")).toBeInTheDocument();
  });

  it("should render the card labels", () => {
    render(<TimerSettings />);

    expect(screen.getByText("Focus")).toBeInTheDocument();
    expect(screen.getByText("Short Break")).toBeInTheDocument();
    expect(screen.getByText("Long Break")).toBeInTheDocument();
  });

  it("should render the save button", () => {
    render(<TimerSettings />);

    expect(screen.getByText("Save changes")).toBeInTheDocument();
  });

  it("should disable save button when no unsaved changes", () => {
    render(<TimerSettings />);

    const saveButton = screen.getByText("Save changes");
    expect(saveButton).toBeDisabled();
  });

  it("should not show reset button when no unsaved changes", () => {
    render(<TimerSettings />);

    expect(screen.queryByText("Reset")).not.toBeInTheDocument();
  });

  it("should enable save button when there are unsaved changes", () => {
    // Set drafts to differ from store values
    mockDraftFocus = "30";

    render(<TimerSettings />);

    const saveButton = screen.getByText("Save changes");
    expect(saveButton).not.toBeDisabled();
  });

  it("should show reset button when there are unsaved changes", () => {
    mockDraftFocus = "30";

    render(<TimerSettings />);

    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("should show unsaved changes warning when drafts differ", () => {
    mockDraftFocus = "30";

    render(<TimerSettings />);

    expect(screen.getByText("You have unsaved changes")).toBeInTheDocument();
  });

  it("should not show unsaved changes warning when drafts match", () => {
    render(<TimerSettings />);

    expect(
      screen.queryByText("You have unsaved changes"),
    ).not.toBeInTheDocument();
  });
});
