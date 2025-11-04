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
    timerRunning: boolean;
    timerPaused: boolean;
    setStartTimeInMinutes: Dispatch<SetStateAction<number>>;
    setTimerRunning: Dispatch<SetStateAction<boolean>>;
    setTimerPaused: Dispatch<SetStateAction<boolean>>;
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const TimerProvider = ({ children }: TimerProviderProps) => {
    const beepSoundEffect = useRef(new Audio(beepSoundURL));
    const offClickSoundEffect = useRef(new Audio(offClickSoundURL));
    const onClickSoundEffect = useRef(new Audio(onClickSoundURL));
    const [startTimeInMinutes, setStartTimeInMinutes] = useState<number>(25);
    const [timerRunning, setTimerRunning] = useState<boolean>(false);
    const [timerPaused, setTimerPaused] = useState<boolean>(true);

    const contextValue: TimerContextType = useMemo(
        () => ({
            beepSoundEffect,
            offClickSoundEffect,
            onClickSoundEffect,
            startTimeInMinutes,
            timerRunning,
            timerPaused,
            setStartTimeInMinutes,
            setTimerRunning,
            setTimerPaused,
        }),
        [startTimeInMinutes, timerRunning, timerPaused],
    );

    return (
        <TimerContext.Provider value={contextValue}>
            {children}
        </TimerContext.Provider>
    );
};

export { TimerProvider, TimerContext };
