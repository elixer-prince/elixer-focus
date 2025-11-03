import { useState } from "react";
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
}

const TimerDisplay = ({ startTimeInMinutes }: TimerDisplayProps) => {
    const onClickSoundEffect = useRef(new Audio(onClickSoundURL));
    const offClickSoundEffect = useRef(new Audio(offClickSoundURL));
    const beepSoundEffect = useRef(new Audio(beepSoundURL));
    const [remainingTimeInSeconds, setRemainingTimeInSeconds] = useState(
        convertMinutesToSeconds(startTimeInMinutes),
    );

    return (
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-full border-8 border-yellow-500 p-8 text-7xl font-bold transition-all duration-1000 select-none hover:bg-neutral-800">
            {formatTimeInMinutesAndSeconds(remainingTimeInSeconds)}
        </div>
    );
};

export default TimerDisplay;
