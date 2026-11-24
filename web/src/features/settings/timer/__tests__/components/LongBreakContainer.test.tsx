import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

const mockSetDraftLongBreak = vi.fn();

vi.mock("@/features/settings/timer/hooks/useTimerSettingsContext", () => ({
  useTimerSettingsContext: () => ({
    draftFocus: "25",
    draftShortBreak: "5",
    draftLongBreak: "15",
    setDraftFocus: vi.fn(),
    setDraftShortBreak: vi.fn(),
    setDraftLongBreak: mockSetDraftLongBreak,
  }),
}));

vi.mock("@/features/countdown-timer/stores/session-store", () => ({
  useFocusDuration: () => 25,
  useShortBreakDuration: () => 5,
  useLongBreakDuration: () => 15,
}));

vi.mock("@/features/settings/timer/hooks/useValidation", () => ({
  default: () => ({
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

import LongBreakContainer from "@/features/settings/timer/LongBreakContainer";

describe("LongBreakContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the input with label", () => {
    render(<LongBreakContainer />);

    expect(screen.getByText("Minutes")).toBeInTheDocument();
    const input = screen.getByPlaceholderText("15");
    expect(input).toBeInTheDocument();
  });

  it("should display the current draft value", () => {
    render(<LongBreakContainer />);

    const input = screen.getByPlaceholderText("15") as HTMLInputElement;
    expect(input.value).toBe("15");
  });

  it("should call setDraftLongBreak when user types a valid value", async () => {
    const user = userEvent.setup();
    render(<LongBreakContainer />);

    const input = screen.getByPlaceholderText("15") as HTMLInputElement;
    await user.clear(input);
    await user.type(input, "20");

    expect(mockSetDraftLongBreak).toHaveBeenCalled();
  });

  it("should have input type number", () => {
    render(<LongBreakContainer />);

    const input = screen.getByPlaceholderText("15") as HTMLInputElement;
    expect(input.type).toBe("number");
  });

  it("should have min attribute set to 5", () => {
    render(<LongBreakContainer />);

    const input = screen.getByPlaceholderText("15") as HTMLInputElement;
    expect(input.min).toBe("5");
  });
});
