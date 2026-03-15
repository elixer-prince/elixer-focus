import beepSoundURL from "@/assets/sound-effects/beep.mp3";
import tickingSoundURL from "@/assets/sound-effects/ticking.mp3";
import offClickSoundURL from "@/features/countdown-timer/assets/sound-effects/off-click.mp3";
import onClickSoundURL from "@/features/countdown-timer/assets/sound-effects/on-click.mp3";
import resetTimerSoundURL from "@/features/countdown-timer/assets/sound-effects/reset-timer.mp3";
import CountdownContext from "@/features/countdown-timer/stores/CountdownContext";
import type { CountdownTimerContextType } from "@/features/countdown-timer/types/context";
import { getFromLocalStorage } from "@/utils/storage";
import { type PropsWithChildren, useMemo, useRef } from "react";

const CountdownProvider = ({ children }: PropsWithChildren) => {
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerEndTimeRef = useRef<number | null>(
    getFromLocalStorage("timerEndTime") || null,
  );
  const hasPlayedEndBeepRef = useRef<boolean>(false);
  const isEndTickingRef = useRef<boolean>(false);
  const modalRef = useRef<HTMLDialogElement | null>(null);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const timerBeepSoundEffectRef = useRef(new Audio(beepSoundURL));
  const timerOffClickSoundEffectRef = useRef(new Audio(offClickSoundURL));
  const timerOnClickSoundEffectRef = useRef(new Audio(onClickSoundURL));
  const timerTickingSoundEffectRef = useRef(new Audio(tickingSoundURL));
  const resetTimerSoundEffectRef = useRef(new Audio(resetTimerSoundURL));

  const contextValue: CountdownTimerContextType = useMemo(
    () => ({
      timerIntervalRef,
      timerEndTimeRef,
      hasPlayedEndBeepRef,
      isEndTickingRef,
      modalRef,
      elapsedIntervalRef,

      timerBeepSoundEffectRef,
      timerOffClickSoundEffectRef,
      timerOnClickSoundEffectRef,
      timerTickingSoundEffectRef,
      resetTimerSoundEffectRef,
    }),
    [],
  );

  return (
    <CountdownContext.Provider value={contextValue}>
      {children}
    </CountdownContext.Provider>
  );
};

export default CountdownProvider;
