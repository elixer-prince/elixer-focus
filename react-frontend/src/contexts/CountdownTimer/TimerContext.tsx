import {
    createContext,
    useMemo,
    useRef,
    useState,
    type Dispatch,
    type ReactNode,
    type RefObject,
    type SetStateAction,
} from "react";
import { convertMinutesToSeconds } from "../../util/functions/conversion";
import { getFromLocalStorage } from "../../util/functions/storage";
import beepSoundURL from "./../assets/audio/sound-effects/beep.mp3";
import offClickSoundURL from "./../assets/audio/sound-effects/off-click.mp3";
import onClickSoundURL from "./../assets/audio/sound-effects/on-click.mp3";
import tickingSoundURL from "./../assets/audio/sound-effects/ticking.mp3";

interface TimerProviderProps {
    children: ReactNode;
}

type TimerContextType = {
    readonly timerBeepSoundEffect: RefObject<HTMLAudioElement>;
    readonly timerOffClickSoundEffect: RefObject<HTMLAudioElement>;
    readonly timerOnClickSoundEffect: RefObject<HTMLAudioElement>;
    readonly timerTickingSoundEffect: RefObject<HTMLAudioElement>;
    timerInterval: RefObject<ReturnType<typeof setInterval> | null>;
    timerEndTime: RefObject<number | null>;
    pauseRemaining: RefObject<number | null>;

    timerRunning: boolean;
    setTimerRunning: Dispatch<SetStateAction<boolean>>;
    timerPaused: boolean;
    setTimerPaused: Dispatch<SetStateAction<boolean>>;
    remainingTimeInSeconds: number;
    setRemainingTimeInSeconds: Dispatch<SetStateAction<number>>;
    startTimeInMinutes: number;
    setStartTimeInMinutes: Dispatch<SetStateAction<number>>;
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const TimerProvider = ({ children }: TimerProviderProps) => {
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
    const pauseRemaining = useRef<number | null>(null);

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

    const contextValue: TimerContextType = useMemo(
        () => ({
            timerBeepSoundEffect,
            timerOffClickSoundEffect,
            timerOnClickSoundEffect,
            timerTickingSoundEffect,
            timerInterval,
            timerEndTime: timerEndTime,
            pauseRemaining,

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
        <TimerContext.Provider value={contextValue}>
            {children}
        </TimerContext.Provider>
    );
};

export { TimerContext, TimerProvider };
