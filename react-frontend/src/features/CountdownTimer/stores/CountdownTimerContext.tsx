import beepSoundURL from "@features/CountdownTimer/assets/sound-effects/beep.mp3";
import offClickSoundURL from "@features/CountdownTimer/assets/sound-effects/off-click.mp3";
import onClickSoundURL from "@features/CountdownTimer/assets/sound-effects/on-click.mp3";
import resetTimerSoundURL from "@features/CountdownTimer/assets/sound-effects/reset-timer.mp3";
import tickingSoundURL from "@features/CountdownTimer/assets/sound-effects/ticking.mp3";
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
import { convertMinutesToSeconds } from "@utils/conversion.ts";

interface CountdownTimerProviderProps {
    children: ReactNode;
}

type CountdownTimerContextType = {
    timerRunning: boolean;
    timerPaused: boolean;
    remainingTimeInSeconds: number;
    startTimeInMinutes: number;
    setTimerRunning: Dispatch<SetStateAction<boolean>>;
    setTimerPaused: Dispatch<SetStateAction<boolean>>;
    setRemainingTimeInSeconds: Dispatch<SetStateAction<number>>;
    setStartTimeInMinutes: Dispatch<SetStateAction<number>>;

    timerInterval: RefObject<ReturnType<typeof setInterval> | null>;
    timerEndTime: RefObject<number | null>;
    hasPlayedEndBeep: RefObject<boolean>;
    isEndTicking: RefObject<boolean>;

    readonly timerBeepSoundEffect: RefObject<HTMLAudioElement>;
    readonly timerOffClickSoundEffect: RefObject<HTMLAudioElement>;
    readonly timerOnClickSoundEffect: RefObject<HTMLAudioElement>;
    readonly timerTickingSoundEffect: RefObject<HTMLAudioElement>;
    readonly resetTimerSoundEffect: RefObject<HTMLAudioElement>;
};

const CountdownTimerContext = createContext<
    CountdownTimerContextType | undefined
>(undefined);

const CountdownTimerProvider = ({ children }: CountdownTimerProviderProps) => {
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

    const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const timerEndTime = useRef<number | null>(
        getFromLocalStorage("timerEndTime") || null,
    );
    const hasPlayedEndBeep = useRef<boolean>(false);
    const isEndTicking = useRef<boolean>(false);

    const timerBeepSoundEffect = useRef(new Audio(beepSoundURL));
    const timerOffClickSoundEffect = useRef(new Audio(offClickSoundURL));
    const timerOnClickSoundEffect = useRef(new Audio(onClickSoundURL));
    const timerTickingSoundEffect = useRef(new Audio(tickingSoundURL));
    const resetTimerSoundEffect = useRef(new Audio(resetTimerSoundURL));

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

            timerInterval,
            timerEndTime,
            hasPlayedEndBeep,
            isEndTicking,

            timerBeepSoundEffect,
            timerOffClickSoundEffect,
            timerOnClickSoundEffect,
            timerTickingSoundEffect,
            resetTimerSoundEffect,
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
