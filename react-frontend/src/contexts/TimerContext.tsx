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
import beepSoundURL from "./../assets/audio/sound-effects/beep.mp3";
import offClickSoundURL from "./../assets/audio/sound-effects/off-click.mp3";
import onClickSoundURL from "./../assets/audio/sound-effects/on-click.mp3";

interface TimerProviderProps {
    children: ReactNode;
}

type TimerContextType = {
    beepSoundEffect: RefObject<HTMLAudioElement>;
    offClickSoundEffect: RefObject<HTMLAudioElement>;
    onClickSoundEffect: RefObject<HTMLAudioElement>;
    startTimeInMinutes: number;
    timerInterval: RefObject<ReturnType<typeof setInterval> | null>;
    endTime: RefObject<number | null>;
    timerRunning: boolean;
    timerPaused: boolean;
    remainingTimeInSeconds: number;
    pauseRemaining: RefObject<number | null>;
    setStartTimeInMinutes: Dispatch<SetStateAction<number>>;
    setTimerRunning: Dispatch<SetStateAction<boolean>>;
    setTimerPaused: Dispatch<SetStateAction<boolean>>;
    setRemainingTimeInSeconds: Dispatch<SetStateAction<number>>;
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const TimerProvider = ({ children }: TimerProviderProps) => {
    const beepSoundEffect = useRef(new Audio(beepSoundURL));
    const offClickSoundEffect = useRef(new Audio(offClickSoundURL));
    const onClickSoundEffect = useRef(new Audio(onClickSoundURL));
    const [startTimeInMinutes, setStartTimeInMinutes] = useState<number>(25);
    const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);
    const endTime = useRef<number | null>(null);
    const [timerRunning, setTimerRunning] = useState<boolean>(false);
    const [timerPaused, setTimerPaused] = useState<boolean>(true);
    const pauseRemaining = useRef<number | null>(null);
    const [remainingTimeInSeconds, setRemainingTimeInSeconds] = useState(0);

    const contextValue: TimerContextType = useMemo(
        () => ({
            beepSoundEffect,
            offClickSoundEffect,
            onClickSoundEffect,
            startTimeInMinutes,
            timerInterval,
            endTime,
            timerRunning,
            timerPaused,
            pauseRemaining,
            remainingTimeInSeconds,
            setStartTimeInMinutes,
            setTimerRunning,
            setTimerPaused,
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

export { TimerProvider, TimerContext };
