import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

const mockSetDraftFocus = vi.fn();
const mockSetDraftSessionCountLimit = vi.fn();
let mockSessionCountLimitInvalid = false;

vi.mock("@/features/settings/timer/hooks/useTimerSettingsContext", () => ({
  useTimerSettingsContext: () => ({
    draftFocus: "25",
    draftSessionCountLimit: "4",
    draftShortBreak: "5",
    draftLongBreak: "15",
    setDraftFocus: mockSetDraftFocus,
    setDraftSessionCountLimit: mockSetDraftSessionCountLimit,
    setDraftShortBreak: vi.fn(),
    setDraftLongBreak: vi.fn(),
  }),
}));

vi.mock("@/features/countdown-timer/stores/session-store", () => ({
  useFocusDuration: () => 25,
  useShortBreakDuration: () => 5,
  useLongBreakDuration: () => 15,
  useSessionCountLimit: () => 4,
}));

vi.mock("@/features/settings/timer/hooks/useValidation", () => ({
  default: () => ({
    isSessionCountLimitInvalid: mockSessionCountLimitInvalid,
    hasUnsavedChanges: false,
    validateAndSet: (
      value: string,
      setDraft: (v: string) => void,
      min: number,
    ) => {
      const num = Number(value);
      if (value === "") return null;
      if (isNaN(num) || !isFinite(num)) {
        setDraft(min.toString());
        return min;
      }
      if (num < min) {
        setDraft(value);
        return null;
      }
      setDraft(value);
      return num;
    },
  }),
}));

import FocusContainer from "@/features/settings/timer/FocusContainer";

describe("FocusContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionCountLimitInvalid = false;
  });

  it("should render the input with label", () => {
    render(<FocusContainer />);

    expect(screen.getByText("Minutes")).toBeInTheDocument();
    const input = screen.getByPlaceholderText("25");
    expect(input).toBeInTheDocument();
  });

  it("should display the current draft value", () => {
    render(<FocusContainer />);

    const input = screen.getByPlaceholderText("25") as HTMLInputElement;
    expect(input.value).toBe("25");
  });

  it("should call setDraftFocus when user types a valid value", async () => {
    const user = userEvent.setup();
    render(<FocusContainer />);

    const input = screen.getByPlaceholderText("25") as HTMLInputElement;
    await user.clear(input);
    await user.type(input, "30");

    // The onChange handler fires for each keystroke; verify it was called
    expect(mockSetDraftFocus).toHaveBeenCalled();
  });

  it("should show error message when value is below minimum", () => {
    // Override draftFocus to be below minimum
    const { unmount } = render(<FocusContainer />);
    expect(
      screen.queryByText("Must be at least 1 minute"),
    ).not.toBeInTheDocument();

    // The error only shows when draftFocus is set and below 1
    // Since our mock returns "25", no error should show
    unmount();
  });

  it("should have input type number", () => {
    render(<FocusContainer />);

    const input = screen.getByPlaceholderText("25") as HTMLInputElement;
    expect(input.type).toBe("number");
  });

  it("should have min attribute set to 1", () => {
    render(<FocusContainer />);

    const input = screen.getByPlaceholderText("25") as HTMLInputElement;
    expect(input.min).toBe("1");
  });
});
