import useTimer from "../../hooks/useTimer";
import { convertMinutesToSeconds } from "../../util/functions/conversion";

const TimerFocusRing = () => {
    const {
        startTimeInMinutes,
        formattedTimeRemaining,
        handleTimerState,
        remainingTimeInSeconds,
    } = useTimer();

    const totalTimeInSeconds = convertMinutesToSeconds(startTimeInMinutes);
    const progress =
        totalTimeInSeconds > 0
            ? (remainingTimeInSeconds / totalTimeInSeconds) * 100
            : 0;

    const radius = 150;
    const circumference = 2 * Math.PI * radius;
    const dashoffset = circumference - (circumference * progress) / 100;

    return (
        <button
            className="relative aspect-square max-w-full overflow-hidden rounded-full p-10 transition-all duration-1000 select-none hover:bg-neutral-800 hover:duration-1000 active:bg-neutral-700 active:duration-100"
            onClick={handleTimerState}
        >
            <div>
                {remainingTimeInSeconds}{" "}
                <span className="text-sm font-bold text-yellow-500">secs</span>
            </div>
            <svg
                className="absolute inset-0 size-full rotate-270 overflow-hidden rounded-full"
                viewBox="0 0 310 310"
            >
                <circle
                    className="fill-none stroke-neutral-700 stroke-10"
                    cx="155"
                    cy="155"
                    r={radius}
                />
                <circle
                    className="fill-none stroke-yellow-500 stroke-10"
                    cx="155"
                    cy="155"
                    r={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                />
            </svg>
            <span className="text-7xl">{formattedTimeRemaining}</span>
        </button>
    );
};

export default TimerFocusRing;
