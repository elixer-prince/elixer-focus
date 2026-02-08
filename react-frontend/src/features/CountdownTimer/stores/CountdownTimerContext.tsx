import beepSoundURL from "@/features/CountdownTimer/assets/sound-effects/beep.mp3";
import offClickSoundURL from "@/features/CountdownTimer/assets/sound-effects/off-click.mp3";
import onClickSoundURL from "@/features/CountdownTimer/assets/sound-effects/on-click.mp3";
import resetTimerSoundURL from "@/features/CountdownTimer/assets/sound-effects/reset-timer.mp3";
import tickingSoundURL from "@/features/CountdownTimer/assets/sound-effects/ticking.mp3";
import { convertMinutesToSeconds } from "@/utils/conversion";
import { getFromLocalStorage } from "@/utils/storage";
import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type RefObject,
  type SetStateAction,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type CountdownTimerContextType = {
  timerRunning: boolean;
  timerPaused: boolean;
  remainingTimeInSeconds: number;
  startTimeInMinutes: number;
  setTimerRunning: Dispatch<SetStateAction<boolean>>;
  setTimerPaused: Dispatch<SetStateAction<boolean>>;
  setRemainingTimeInSeconds: Dispatch<SetStateAction<number>>;
  setStartTimeInMinutes: Dispatch<SetStateAction<number>>;

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
  const [startTimeInMinutes, setStartTimeInMinutes] = useState<number>(
    getFromLocalStorage("startTimeInMinutes") || 25,
  );
  const [remainingTimeInSeconds, setRemainingTimeInSeconds] = useState(
    () =>
      getFromLocalStorage("remainingTimeInSeconds") ||
      convertMinutesToSeconds(startTimeInMinutes),
  );
  const [timerRunning, setTimerRunning] = useState<boolean>(
    () => getFromLocalStorage("timerRunning") ?? false,
  );
  const [timerPaused, setTimerPaused] = useState<boolean>(
    () => getFromLocalStorage("timerPaused") ?? true,
  );

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

  const contextValue: CountdownTimerContextType = useMemo(
    () => ({
      startTimeInMinutes,
      timerRunning,
      timerPaused,
      remainingTimeInSeconds,
      setStartTimeInMinutes,
      setTimerRunning,
      setTimerPaused,
      setRemainingTimeInSeconds,

      timerIntervalRef,
      timerEndTimeRef,
      hasPlayedEndBeepRef,
      isEndTickingRef,

      timerBeepSoundEffectRef,
      timerOffClickSoundEffectRef,
      timerOnClickSoundEffectRef,
      timerTickingSoundEffectRef,
      resetTimerSoundEffectRef,
    }),
    [startTimeInMinutes, timerRunning, timerPaused, remainingTimeInSeconds],
  );

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
