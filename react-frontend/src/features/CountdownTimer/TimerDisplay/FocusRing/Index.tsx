import useFocusRing from "@features/CountdownTimer/TimerDisplay/FocusRing/hooks/useFocusRing.tsx";

const FocusRing = () => {
    const { radius, dashoffset, dotX, dotY, circumference } = useFocusRing();

    return (
        <svg
            className="absolute inset-0 size-full rotate-270 overflow-hidden rounded-full"
            viewBox="0 0 344 344"
        >
            {/* Background track */}
            <circle
                className="stroke-primary-content/25 fill-none stroke-8"
                cx="172"
                cy="172"
                r={radius}
            />

            {/* Active / coloured arc */}
            <circle
                className="stroke-primary text-primary fill-none stroke-8"
                cx="172"
                cy="172"
                r={radius}
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
                strokeLinecap="round"
                style={{
                    transition: "stroke-dashoffset 1s linear",
                    filter: "drop-shadow(0 0 4px currentColor)",
                }}
            />

            {/* Dot */}
            <circle
                className="fill-primary text-primary transition-all duration-1000 ease-linear"
                cx={dotX}
                cy={dotY}
                r={12}
                style={{ filter: "drop-shadow(0 0 6px currentColor)" }}
            />
        </svg>
    );
};

export default FocusRing;
