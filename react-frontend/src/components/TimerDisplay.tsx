import {
    convertMinutesToSeconds,
    formatTimeInMinutesAndSeconds,
} from "../utils/timerFunctions";

interface TimerDisplayProps {
    startTimeInMinutes: number;
}

const TimerDisplay = ({ startTimeInMinutes }: TimerDisplayProps) => {
    const startTimeInSeconds = convertMinutesToSeconds(startTimeInMinutes);

    return (
        <div className="flex aspect-square w-full max-w-full items-center justify-center rounded-full border-2 p-20 text-7xl font-bold select-none">
            {formatTimeInMinutesAndSeconds(startTimeInSeconds)}
        </div>
    );
};

export default TimerDisplay;
