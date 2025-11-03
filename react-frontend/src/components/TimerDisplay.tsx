import {
    convertMinutesToSeconds,
    formatTimeInMinutesAndSeconds,
} from "../utils/timerFunctions";

interface TimerDisplayProps {
    startTimeInMinutes: number;
}

const TimerDisplay = ({ startTimeInMinutes }: TimerDisplayProps) => {
    const startTimeInSeconds = convertMinutesToSeconds(startTimeInMinutes);
    const remainingTimeInSeconds = startTimeInSeconds;

    return (
        <div className="flex aspect-square w-full max-w-full items-center justify-center overflow-hidden rounded-full border-3 p-20 text-7xl font-bold select-none">
            {formatTimeInMinutesAndSeconds(remainingTimeInSeconds)}
        </div>
    );
};

export default TimerDisplay;
