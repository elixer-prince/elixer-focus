import useFocusRing from "@features/CountdownTimer/TimerDisplay/FocusRing/hooks/useFocusRing.tsx";

const CENTER = 172;

const FocusRing = () => {
    const { radius, dashoffset, circumference, angleDeg } = useFocusRing();

    return (
        <svg
            className="pointer-events-none absolute inset-0 size-full rotate-270 overflow-hidden rounded-full"
            viewBox="0 0 344 344"
        >
            {/* Background track */}
            <circle
                className="fill-none stroke-neutral-600 stroke-8"
                cx={CENTER}
                cy={CENTER}
                r={radius}
            />

            {/* Active / coloured arc */}
            <circle
                className="stroke-primary text-primary fill-none stroke-8"
                cx={CENTER}
                cy={CENTER}
                r={radius}
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
                strokeLinecap="round"
                style={{
                    transition: "stroke-dashoffset 1s linear",
                    filter: "drop-shadow(0 0 8px currentColor)",
                }}
            />

            {/* Dot – sits at top of circle, then rotates around the center */}
            <circle
                className="fill-primary text-primary transition-transform duration-1000 ease-linear"
                cx={CENTER + radius} // 3 o'clock before svg rotation
                cy={CENTER}
                r={12}
                style={{
                    transformOrigin: `${CENTER}px ${CENTER}px`,
                    transform: `rotate(${angleDeg}deg)`,
                    filter: "drop-shadow(0 0 6px currentColor)",
                }}
            />
        </svg>
    );
};

export default FocusRing;
