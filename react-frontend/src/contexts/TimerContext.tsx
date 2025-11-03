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

type TimerContextType = {
    beepSoundEffect: RefObject<HTMLAudioElement>;
    offClickSoundEffect: RefObject<HTMLAudioElement>;
    onClickSoundEffect: RefObject<HTMLAudioElement>;
    startTimeInMinutes: number;
    timerRunning: boolean;
    setTimerRunning: Dispatch<SetStateAction<boolean>>;
    setStartTimeInMinutes: Dispatch<SetStateAction<number>>;
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const TimerProvider = ({ children }: { children: ReactNode }) => {
    const beepSoundEffect = useRef(new Audio(beepSoundURL));
    const offClickSoundEffect = useRef(new Audio(offClickSoundURL));
    const onClickSoundEffect = useRef(new Audio(onClickSoundURL));
    const [startTimeInMinutes, setStartTimeInMinutes] = useState(25);
    const [timerRunning, setTimerRunning] = useState(false);

    const contextValue: TimerContextType = useMemo(
        () => ({
            beepSoundEffect,
            offClickSoundEffect,
            onClickSoundEffect,
            startTimeInMinutes,
            timerRunning,
            setTimerRunning,
            setStartTimeInMinutes,
        }),
        [startTimeInMinutes, timerRunning],
    );

    return (
        <TimerContext.Provider value={contextValue}>
            {children}
        </TimerContext.Provider>
    );
};

export { TimerProvider, TimerContext };
