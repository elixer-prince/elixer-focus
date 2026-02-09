import beepSoundURL from "@/features/countdown-timer/assets/sound-effects/beep.mp3";
import offClickSoundURL from "@/features/countdown-timer/assets/sound-effects/off-click.mp3";
import onClickSoundURL from "@/features/countdown-timer/assets/sound-effects/on-click.mp3";
import resetTimerSoundURL from "@/features/countdown-timer/assets/sound-effects/reset-timer.mp3";
import tickingSoundURL from "@/features/countdown-timer/assets/sound-effects/ticking.mp3";
import { getFromLocalStorage } from "@/utils/storage";
import {
  createContext,
  type PropsWithChildren,
  type RefObject,
  useContext,
  useRef,
} from "react";

type CountdownTimerContextType = {
  timerIntervalRef: RefObject<ReturnType<typeof setInterval> | null>;
  timerEndTimeRef: RefObject<number | null>;
  hasPlayedEndBeepRef: RefObject<boolean>;
  isEndTickingRef: RefObject<boolean>;

  readonly timerBeepSoundEffectRef: RefObject<HTMLAudioElement>;
  readonly timerOffClickSoundEffectRef: RefObject<HTMLAudioElement>;
  readonly timerOnClickSoundEffectRef: RefObject<HTMLAudioElement>;
  readonly timerTickingSoundEffectRef: RefObject<HTMLAudioElement>;
  readonly resetTimerSoundEffectRef: RefObject<HTMLAudioElement>;
};

const CountdownTimerContext = createContext<
  CountdownTimerContextType | undefined
>(undefined);

export const CountdownTimerProvider = ({ children }: PropsWithChildren) => {
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerEndTimeRef = useRef<number | null>(
    getFromLocalStorage("timerEndTime") || null,
  );
  const hasPlayedEndBeepRef = useRef<boolean>(false);
  const isEndTickingRef = useRef<boolean>(false);

  const timerBeepSoundEffectRef = useRef(new Audio(beepSoundURL));
  const timerOffClickSoundEffectRef = useRef(new Audio(offClickSoundURL));
  const timerOnClickSoundEffectRef = useRef(new Audio(onClickSoundURL));
  const timerTickingSoundEffectRef = useRef(new Audio(tickingSoundURL));
  const resetTimerSoundEffectRef = useRef(new Audio(resetTimerSoundURL));

  const contextValue: CountdownTimerContextType = {
    timerIntervalRef,
    timerEndTimeRef,
    hasPlayedEndBeepRef,
    isEndTickingRef,

    timerBeepSoundEffectRef,
    timerOffClickSoundEffectRef,
    timerOnClickSoundEffectRef,
    timerTickingSoundEffectRef,
    resetTimerSoundEffectRef,
  };

  return (
    <CountdownTimerContext.Provider value={contextValue}>
      {children}
    </CountdownTimerContext.Provider>
  );
};

export const useCountdownTimerContext = () => {
  const countdownTimerContext = useContext(CountdownTimerContext);

  if (!countdownTimerContext)
    throw new Error("CountdownTimerContext must be defined!");

  return countdownTimerContext;
};
