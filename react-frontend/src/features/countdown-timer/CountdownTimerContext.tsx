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
import {convertMinutesToSeconds} from "utils/functions/conversion.ts";
import {getFromLocalStorage} from "../../utils/functions/storage.ts";
import beepSoundURL from "../../assets/sound-effects/beep.mp3";
import offClickSoundURL from "../../assets/sound-effects/off-click.mp3";
import onClickSoundURL from "../../assets/sound-effects/on-click.mp3";
import tickingSoundURL from "../../assets/sound-effects/ticking.mp3";
import resetTimerSoundURL from "../../assets/sound-effects/reset-timer.mp3";

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
    timeRemainingOnPause: RefObject<number | null>;
    timerRunning: boolean;
    setTimerRunning: Dispatch<SetStateAction<boolean>>;
    timerPaused: boolean;
    setTimerPaused: Dispatch<SetStateAction<boolean>>;
    remainingTimeInSeconds: number;
    setRemainingTimeInSeconds: Dispatch<SetStateAction<number>>;
    startTimeInMinutes: number;
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

    /**
     * The timer interval is null at component initialisation and does not
     * trigger a rerender.
     *
     */
    const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    const [startTimeInMinutes, setStartTimeInMinutes] = useState<number>(
        getFromLocalStorage("startTimeInMinutes") || 25,
    );

    const timerEndTime = useRef<number | null>(null);
    const timeRemainingOnPause = useRef<number | null>(null);

    const [remainingTimeInSeconds, setRemainingTimeInSeconds] = useState(() =>
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

    const [timerRunning, setTimerRunning] = useState<boolean>(false);
    const [timerPaused, setTimerPaused] = useState<boolean>(true);

    const contextValue: CountdownTimerContextType = useMemo(
        () => ({
            timerBeepSoundEffect,
            timerOffClickSoundEffect,
            timerOnClickSoundEffect,
            timerTickingSoundEffect,
            resetTimerSoundEffect,
            timerInterval,
            timerEndTime,
            timeRemainingOnPause,
            startTimeInMinutes,
            setStartTimeInMinutes,
            timerRunning,
            setTimerRunning,
            timerPaused,
            setTimerPaused,
            remainingTimeInSeconds,
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
