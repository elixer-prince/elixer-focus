import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

const mockSetDraftShortBreak = vi.fn();

vi.mock("@/features/settings/timer/hooks/useTimerSettingsContext", () => ({
  useTimerSettingsContext: () => ({
    draftFocus: "25",
    draftShortBreak: "5",
    draftLongBreak: "15",
    setDraftFocus: vi.fn(),
    setDraftShortBreak: mockSetDraftShortBreak,
    setDraftLongBreak: vi.fn(),
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

import ShortBreakContainer from "@/features/settings/timer/ShortBreakContainer";

describe("ShortBreakContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the input with label", () => {
    render(<ShortBreakContainer />);

    expect(screen.getByText("Minutes")).toBeInTheDocument();
    const input = screen.getByPlaceholderText("5");
    expect(input).toBeInTheDocument();
  });

  it("should display the current draft value", () => {
    render(<ShortBreakContainer />);

    const input = screen.getByPlaceholderText("5") as HTMLInputElement;
    expect(input.value).toBe("5");
  });

  it("should call setDraftShortBreak when user types a valid value", async () => {
    const user = userEvent.setup();
    render(<ShortBreakContainer />);

    const input = screen.getByPlaceholderText("5") as HTMLInputElement;
    await user.clear(input);
    await user.type(input, "10");

    expect(mockSetDraftShortBreak).toHaveBeenCalled();
  });

  it("should have input type number", () => {
    render(<ShortBreakContainer />);

    const input = screen.getByPlaceholderText("5") as HTMLInputElement;
    expect(input.type).toBe("number");
  });

  it("should have min attribute set to 1", () => {
    render(<ShortBreakContainer />);

    const input = screen.getByPlaceholderText("5") as HTMLInputElement;
    expect(input.min).toBe("1");
  });
});
