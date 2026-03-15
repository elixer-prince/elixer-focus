import useCountdownContext from "@/features/countdown-timer/hooks/useCountdownContext";

const useCountdownAlerts = () => {
  const { modalRef } = useCountdownContext();

  const alertUserOfTimerEnd = () => {
    modalRef.current?.showModal();
  };

  return { alertUserOfTimerEnd };
};

export default useCountdownAlerts;
