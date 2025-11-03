import useTimer from "../../hooks/useTimer";

interface TimerDisplayProps {
    startTimeInMinutes: number;
}

const TimerDisplay = ({ startTimeInMinutes }: TimerDisplayProps) => {
    const { formattedTimeRemaining, handleTimerState } = useTimer({
        startTimeInMinutes,
    });

    return (
        <button
            className="flex aspect-square items-center justify-center overflow-hidden rounded-full border-8 border-yellow-500 p-8 text-7xl font-bold transition-all duration-1000 select-none hover:bg-neutral-800 hover:duration-1000 active:bg-neutral-700 active:duration-100"
            onClick={handleTimerState}
        >
            {formattedTimeRemaining}
        </button>
    );
};

export default TimerDisplay;
