import type { RefObject } from "react";

export type CountdownSession = "Focus" | "Short Break" | "Long Break";

export type CountdownTimerContextType = {
  timerIntervalRef: RefObject<ReturnType<typeof setInterval> | null>;
  timerEndTimeRef: RefObject<number | null>;
  hasPlayedEndBeepRef: RefObject<boolean>;
  isEndTickingRef: RefObject<boolean>;
  modalRef: RefObject<HTMLDialogElement | null>;

  readonly timerBeepSoundEffectRef: RefObject<HTMLAudioElement>;
  readonly timerOffClickSoundEffectRef: RefObject<HTMLAudioElement>;
  readonly timerOnClickSoundEffectRef: RefObject<HTMLAudioElement>;
  readonly timerTickingSoundEffectRef: RefObject<HTMLAudioElement>;
  readonly resetTimerSoundEffectRef: RefObject<HTMLAudioElement>;
};
