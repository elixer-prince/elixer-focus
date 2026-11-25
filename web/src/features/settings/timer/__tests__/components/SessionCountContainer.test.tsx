import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

const mockSetDraftSessionCountLimit = vi.fn();
let mockSessionCountLimitInvalid = false;

vi.mock("@/features/settings/timer/hooks/useTimerSettingsContext", () => ({
  useTimerSettingsContext: () => ({
    draftFocus: "25",
    draftSessionCountLimit: "4",
    draftShortBreak: "5",
    draftLongBreak: "15",
    setDraftFocus: vi.fn(),
    setDraftSessionCountLimit: mockSetDraftSessionCountLimit,
    setDraftShortBreak: vi.fn(),
    setDraftLongBreak: vi.fn(),
  }),
}));

vi.mock("@/features/settings/timer/hooks/useValidation", () => ({
  default: () => ({
    isSessionCountLimitInvalid: mockSessionCountLimitInvalid,
    hasUnsavedChanges: false,
    validateAndSet: vi.fn(),
  }),
}));

import SessionCountContainer from "@/features/settings/timer/SessionCountContainer";

describe("SessionCountContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionCountLimitInvalid = false;
  });

  it("renders the saved draft and allowed whole number range", () => {
    render(<SessionCountContainer />);

    const input = screen.getByRole("spinbutton", {
      name: "Focus sessions before a long break",
    }) as HTMLInputElement;

    expect(input.value).toBe("4");
    expect(input.min).toBe("1");
    expect(input.max).toBe("8");
    expect(input.step).toBe("1");
  });

  it("keeps the entered session count draft", () => {
    render(<SessionCountContainer />);

    const input = screen.getByRole("spinbutton", {
      name: "Focus sessions before a long break",
    });
    fireEvent.change(input, { target: { value: "1.5" } });

    expect(mockSetDraftSessionCountLimit).toHaveBeenCalledWith("1.5");
  });

  it("exposes session count validation inline", () => {
    mockSessionCountLimitInvalid = true;

    render(<SessionCountContainer />);

    const input = screen.getByRole("spinbutton", {
      name: "Focus sessions before a long break",
    });
    expect(input).toHaveAttribute("aria-invalid", "true");
    const descriptionId = input.getAttribute("aria-describedby");
    expect(descriptionId).toBeTruthy();
    expect(document.getElementById(descriptionId!)).toHaveTextContent(
      "Enter a whole number from 1 to 8",
    );
  });
});
