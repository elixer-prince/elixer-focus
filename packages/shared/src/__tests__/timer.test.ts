import {
  createTimerSettingsSlice,
  type TimerSettingsSlice,
} from "@elixer-focus/shared/timer";
import { createStore } from "zustand/vanilla";
import { describe, expect, it } from "vitest";

describe("shared timer settings", () => {
  it("uses the existing defaults and accepts valid settings", () => {
    const store = createStore<TimerSettingsSlice>()(
      createTimerSettingsSlice<TimerSettingsSlice>(),
    );

    expect(store.getState()).toMatchObject({
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionCountLimit: 4,
      attributeSessionOverrun: true,
    });

    store.getState().setFocusDuration(45);
    store.getState().setSessionCountLimit(8);
    expect(store.getState().focusDuration).toBe(45);
    expect(store.getState().sessionCountLimit).toBe(8);
  });

  it("does not apply invalid duration or session count values", () => {
    const store = createStore<TimerSettingsSlice>()(
      createTimerSettingsSlice<TimerSettingsSlice>(),
    );

    store.getState().setFocusDuration(Number.NaN);
    store.getState().setShortBreakDuration(0);
    store.getState().setSessionCountLimit(1.5);
    store.getState().setSessionCountLimit(9);

    expect(store.getState()).toMatchObject({
      focusDuration: 25,
      shortBreakDuration: 5,
      sessionCountLimit: 4,
    });
  });
});
