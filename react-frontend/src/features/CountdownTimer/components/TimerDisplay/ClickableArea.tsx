import useHandleCountdownState from "@features/CountdownTimer/components/TimerDisplay/hooks/useHandleCountdownState.ts";

const ClickableArea = () => {
    const { handleCountdownState } = useHandleCountdownState();

    return (
        <button
            className="hover:bg-base-200 active:bg-base-100 bg-transition-all peer pointer-events-auto absolute inset-5 rounded-full duration-1000 hover:duration-1000 active:duration-100"
            onClick={handleCountdownState}
        ></button>
    );
};

export default ClickableArea;
