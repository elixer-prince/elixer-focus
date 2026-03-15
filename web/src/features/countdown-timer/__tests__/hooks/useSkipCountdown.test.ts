import { act, renderHook } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  autoSwitchSessionType: vi.fn(),
  playSound: vi.fn(),
  confirm: vi.fn(),
  resetTimerSoundEffectRef: { current: "reset-sound" as string | null },
}));

vi.mock("@/features/countdown-timer/hooks/useSessionSwitch", () => ({
  default: () => ({
    autoSwitchSessionType: mocks.autoSwitchSessionType,
  }),
}));

vi.mock("@/features/countdown-timer/hooks/useCountdownContext", () => ({
  default: () => ({
    resetTimerSoundEffectRef: mocks.resetTimerSoundEffectRef,
  }),
}));

vi.mock("@/utils/sound", () => ({
  playSound: mocks.playSound,
}));

import useSkipCountdown from "@/features/countdown-timer/hooks/useSkipCountdown";

describe("useSkipCountdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.confirm.mockReturnValue(true);
    vi.stubGlobal("confirm", mocks.confirm);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should do nothing when confirmation is rejected", () => {
    mocks.confirm.mockReturnValue(false);

    const { result } = renderHook(() => useSkipCountdown());

    act(() => {
      result.current.skipCountdown();
    });

    expect(mocks.playSound).not.toHaveBeenCalled();
    expect(mocks.autoSwitchSessionType).not.toHaveBeenCalled();
  });

  it("should play the reset sound and auto switch session type on confirm", () => {
    const { result } = renderHook(() => useSkipCountdown());

    act(() => {
      result.current.skipCountdown();
    });

    expect(mocks.playSound).toHaveBeenCalledWith("reset-sound");
    expect(mocks.autoSwitchSessionType).toHaveBeenCalled();
  });
});
