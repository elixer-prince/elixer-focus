import useHandleCountdownState from "@/features/CountdownTimer/components/TimerDisplay/hooks/useHandleCountdownState";

const ClickableArea = () => {
  const { handleCountdownState } = useHandleCountdownState();

  return (
    <button
      onClick={handleCountdownState}
      className={
        "hover:bg-base-200 active:bg-base-100 bg-transition-all peer pointer-events-auto absolute inset-5 rounded-full duration-1000 hover:duration-1000 active:duration-100"
      }
    />
  );
};

export default ClickableArea;
