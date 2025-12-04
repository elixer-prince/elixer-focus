import useHandleCountdownState from "@features/CountdownTimer/CountdownDisplay/hooks/useHandleCountdownState.tsx";
import CountdownMinutesAndSeconds from "@features/CountdownTimer/CountdownMinutesAndSeconds.tsx";
import CountdownSeconds from "@features/CountdownTimer/CountdownSeconds.tsx";
import FocusRing from "@features/CountdownTimer/FocusRing/Index.tsx";
import useSessionContext from "@features/CountdownTimer/SessionDisplay/hooks/useSessionContext.tsx";

const CountdownDisplay = () => {
    const { handleCountdownState } = useHandleCountdownState();
    const { currentSessionCount } = useSessionContext();

    return (
        <button
            className="hover:bg-base-200 active:bg-base-100 relative flex aspect-square w-70 max-w-full flex-col items-center justify-center overflow-hidden rounded-full p-10 transition-all duration-1000 outline-none select-none hover:duration-1000 active:duration-100"
            onClick={handleCountdownState}
        >
            <div className="absolute top-12 rounded-md px-2 py-1 font-bold">
                #{currentSessionCount}
            </div>
            <CountdownSeconds />
            <FocusRing />
            <CountdownMinutesAndSeconds />
        </button>
    );
};

export default CountdownDisplay;
