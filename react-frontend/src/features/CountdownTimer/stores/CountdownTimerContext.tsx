import beepSoundURL from "@features/CountdownTimer/assets/beep-sound-effect.mp3";
import offClickSoundURL from "@features/CountdownTimer/assets/off-click-sound-effect.mp3";
import onClickSoundURL from "@features/CountdownTimer/assets/on-click-sound-effect.mp3";
import resetTimerSoundURL from "@features/CountdownTimer/assets/reset-timer-sound-effect.mp3";
import tickingSoundURL from "@features/CountdownTimer/assets/ticking-sound-effect.mp3";
import { convertMinutesToSeconds } from "@utils/conversion.ts";
import { getFromLocalStorage } from "@utils/storage.ts";
import {
    createContext,
    type Dispatch,
    type ReactNode,
    type RefObject,
    type SetStateAction,
    useMemo,
    useRef,
    useState,
} from "react";

interface CountdownTimerProviderProps {
    children: ReactNode;
}

type CountdownTimerContextType = {
    readonly timerBeepSoundEffect: RefObject<HTMLAudioElement>;
    readonly timerOffClickSoundEffect: RefObject<HTMLAudioElement>;
    readonly timerOnClickSoundEffect: RefObject<HTMLAudioElement>;
    readonly timerTickingSoundEffect: RefObject<HTMLAudioElement>;
    readonly resetTimerSoundEffect: RefObject<HTMLAudioElement>;

    timerInterval: RefObject<ReturnType<typeof setInterval> | null>;
    timerEndTime: RefObject<number | null>;

    timerRunning: boolean;
    timerPaused: boolean;
    remainingTimeInSeconds: number;
    startTimeInMinutes: number;
    setTimerRunning: Dispatch<SetStateAction<boolean>>;
    setTimerPaused: Dispatch<SetStateAction<boolean>>;
    setRemainingTimeInSeconds: Dispatch<SetStateAction<number>>;
    setStartTimeInMinutes: Dispatch<SetStateAction<number>>;
};

const CountdownTimerContext = createContext<
    CountdownTimerContextType | undefined
>(undefined);

const CountdownTimerProvider = ({ children }: CountdownTimerProviderProps) => {
    /*---------------------------------------------------------
    | Audio Elements
    |----------------------------------------------------------
    |
    | These are only initialised once when the component
    | loads and persist/are reused.
    |
    */

    const timerBeepSoundEffect = useRef(new Audio(beepSoundURL));
    const timerOffClickSoundEffect = useRef(new Audio(offClickSoundURL));
    const timerOnClickSoundEffect = useRef(new Audio(onClickSoundURL));
    const timerTickingSoundEffect = useRef(new Audio(tickingSoundURL));
    const resetTimerSoundEffect = useRef(new Audio(resetTimerSoundURL));

    const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    const [startTimeInMinutes, setStartTimeInMinutes] = useState<number>(
        getFromLocalStorage("startTimeInMinutes") || 25,
    );

    const timerEndTime = useRef<number | null>(
        getFromLocalStorage("timerEndTime") || null,
    );

    const [remainingTimeInSeconds, setRemainingTimeInSeconds] = useState(
        () =>
            getFromLocalStorage("remainingTimeInSeconds") ||
            convertMinutesToSeconds(startTimeInMinutes),
    );

    /*---------------------------------------------------------
    | Timer Status
    |----------------------------------------------------------
    |
    | These control whether the timer should start or not by
    | allowing checks.
    |
    */

    const [timerRunning, setTimerRunning] = useState<boolean>(
        () => getFromLocalStorage("timerRunning") ?? false,
    );

    const [timerPaused, setTimerPaused] = useState<boolean>(
        () => getFromLocalStorage("timerPaused") ?? true,
    );

    const contextValue: CountdownTimerContextType = useMemo(
        () => ({
            timerBeepSoundEffect,
            timerOffClickSoundEffect,
            timerOnClickSoundEffect,
            timerTickingSoundEffect,
            resetTimerSoundEffect,

            timerInterval,
            timerEndTime,

            startTimeInMinutes,
            timerRunning,
            timerPaused,
            remainingTimeInSeconds,
            setStartTimeInMinutes,
            setTimerRunning,
            setTimerPaused,
            setRemainingTimeInSeconds,
        }),
        [startTimeInMinutes, timerRunning, timerPaused, remainingTimeInSeconds],
    );

    return (
        <CountdownTimerContext.Provider value={contextValue}>
            {children}
        </CountdownTimerContext.Provider>
    );
};

export { CountdownTimerContext, CountdownTimerProvider };
