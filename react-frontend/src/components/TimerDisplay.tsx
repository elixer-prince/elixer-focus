import {
    useEffect,
    useRef,
    useState,
    type Dispatch,
    type SetStateAction,
} from "react";
import {
    convertMinutesToSeconds,
    formatTimeInMinutesAndSeconds,
} from "../utils/timerFunctions";
import { playSound } from "../utils/utilityFunctions";
import beepSoundURL from "./../assets/audio/sound-effects/beep.mp3";
import offClickSoundURL from "./../assets/audio/sound-effects/off-click.mp3";
import onClickSoundURL from "./../assets/audio/sound-effects/on-click.mp3";

interface TimerDisplayProps {
    startTimeInMinutes: number;
    timerRunning: boolean;
    setTimerRunning: Dispatch<SetStateAction<boolean>>;
}

const TimerDisplay = ({
    startTimeInMinutes,
    timerRunning,
    setTimerRunning,
}: TimerDisplayProps) => {
    const onClickSoundEffect = useRef(new Audio(onClickSoundURL));
    const offClickSoundEffect = useRef(new Audio(offClickSoundURL));
    const beepSoundEffect = useRef(new Audio(beepSoundURL));
    const startTimeInSeconds = useRef(
        convertMinutesToSeconds(startTimeInMinutes),
    );
    const [remainingTimeInSeconds, setRemainingTimeInSeconds] = useState(
        convertMinutesToSeconds(startTimeInMinutes),
    );

    const interval = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (remainingTimeInSeconds <= 0) {
            playSound(beepSoundEffect.current);
            if (interval.current) clearInterval(interval.current);
            setRemainingTimeInSeconds(startTimeInSeconds.current);
        }
    }, [remainingTimeInSeconds]);

    const handleTimerStart = () => {
        if (timerRunning) {
            playSound(offClickSoundEffect.current);
            if (interval.current) clearInterval(interval.current);
            return setTimerRunning(false);
        }

        playSound(onClickSoundEffect.current);
        setTimerRunning(true);
        interval.current = setInterval(() => {
            setRemainingTimeInSeconds((prevTime) => prevTime - 1);
        }, 1000);
    };

    return (
        <button
            className="flex aspect-square items-center justify-center overflow-hidden rounded-full border-8 border-yellow-500 p-8 text-7xl font-bold transition-all duration-1000 select-none hover:bg-neutral-800 hover:duration-1000 active:bg-neutral-700 active:duration-100"
            onClick={handleTimerStart}
        >
            {formatTimeInMinutesAndSeconds(remainingTimeInSeconds)}
        </button>
    );
};

export default TimerDisplay;
