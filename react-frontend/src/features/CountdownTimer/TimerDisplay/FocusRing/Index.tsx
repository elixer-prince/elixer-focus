import useFocusRing from "@features/CountdownTimer/TimerDisplay/FocusRing/hooks/useFocusRing.tsx";

const FocusRing = () => {
    const { radius, dashoffset, dotX, dotY, circumference } = useFocusRing();

    return (
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
                className="fill-primary transition-all duration-1000 ease-linear"
                cx={dotX}
                cy={dotY}
                r={12}
                filter="url(#dot-glow)"
            />
        </svg>
    );
};

export default FocusRing;
