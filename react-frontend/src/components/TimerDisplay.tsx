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
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-full border-8 border-yellow-500 p-8 text-7xl font-bold transition-all duration-500 select-none hover:bg-neutral-800">
            {formatTimeInMinutesAndSeconds(remainingTimeInSeconds)}
        </div>
    );
};

export default TimerDisplay;
