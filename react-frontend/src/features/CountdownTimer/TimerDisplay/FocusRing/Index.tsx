import useFocusRing from "@features/CountdownTimer/TimerDisplay/FocusRing/hooks/useFocusRing.tsx";

const FocusRing = () => {
    const { radius, dashoffset, dotX, dotY, circumference } = useFocusRing();

    return (
        <svg
            className="absolute inset-0 size-full rotate-270 overflow-hidden rounded-full"
            viewBox="0 0 344 344"
        >
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
                className="fill-primary text-primary transition-all duration-1000 ease-linear"
                cx={dotX}
                cy={dotY}
                r={12}
                // Glow color = currentColor
                style={{ filter: "drop-shadow(0 0 8px currentColor)" }}
            />
        </svg>
    );
};

export default FocusRing;
