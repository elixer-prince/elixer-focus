import useCountdownTimer from "@features/CountdownTimer/hooks/useCountdownTimer.tsx";
import CountdownMinutesAndSeconds from "@features/CountdownTimer/CountdownMinutesAndSeconds.tsx";
import CountdownSeconds from "@features/CountdownTimer/CountdownSeconds.tsx";
import FocusRing from "@features/CountdownTimer/FocusRing/Index.tsx";

const CountdownDisplay = () => {
    const { handleCountdownState } = useCountdownTimer();

    return (
        <button
            className="hover:bg-base-200 active:bg-base-100 relative flex aspect-square w-70 max-w-full flex-col items-center justify-center overflow-hidden rounded-full p-10 transition-all duration-1000 outline-none select-none hover:duration-1000 active:duration-100"
            onClick={handleCountdownState}
        >
            <CountdownSeconds />
            <FocusRing />
            <CountdownMinutesAndSeconds />
        </button>
    );
};

export default CountdownDisplay;
