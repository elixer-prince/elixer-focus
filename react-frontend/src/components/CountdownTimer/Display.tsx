import useCountdownTimer from "../../hooks/CountdownTimer/useCountdownTimer.tsx";
import { convertMinutesToSeconds } from "../../util/functions/conversion";

const CountdownDisplay = () => {
    const {
        startTimeInMinutes,
        formattedTimeRemaining,
        handleCountdownState,
        remainingTimeInSeconds,
    } = useCountdownTimer();

    const totalTimeInSeconds = convertMinutesToSeconds(startTimeInMinutes);
    const progress =
        totalTimeInSeconds > 0
            ? (remainingTimeInSeconds / totalTimeInSeconds) * 100
            : 0;

    const radius = 150;
    const circumference = 2 * Math.PI * radius;
    const dashoffset = circumference - (circumference * progress) / 100;

    const angle = 2 * Math.PI * (1 - progress / 100);
    const dotX = 172 + radius * Math.cos(angle);
    const dotY = 172 + radius * Math.sin(angle);

    return (
        <button
            className="hover:bg-base-200 active:bg-base-100 relative flex aspect-square w-70 max-w-full flex-col items-center justify-center overflow-hidden rounded-full p-10 transition-all duration-1000 outline-none select-none hover:duration-1000 active:duration-100"
            onClick={handleCountdownState}
        >
            <span>
                {remainingTimeInSeconds}{" "}
                <span className="text-primary text-sm font-bold">secs</span>
            </span>
            <svg
                className="absolute inset-0 size-full rotate-270 overflow-hidden rounded-full"
                viewBox="0 0 344 344"
            >
                <defs>
                    <filter
                        id="dot-glow"
                        x="-50%"
                        y="-50%"
                        width="260%"
                        height="260%"
                    >
                        <feDropShadow
                            dx="0"
                            dy="0"
                            stdDeviation="6"
                            floodColor="#656dfc"
                            floodOpacity="1"
                        />
                    </filter>
                </defs>
                <circle
                    className="fill-none stroke-neutral-600 stroke-8"
                    cx="172"
                    cy="172"
                    r={radius}
                />
                <circle
                    className="stroke-primary fill-none stroke-8"
                    cx="172"
                    cy="172"
                    r={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                />
                <circle
                    className="fill-primary"
                    cx={dotX}
                    cy={dotY}
                    r={12}
                    filter="url(#dot-glow)"
                />
            </svg>
            <span className="text-7xl">{formattedTimeRemaining}</span>
        </button>
    );
};

export default CountdownDisplay;
