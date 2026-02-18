import useCountdownContext from "@/hooks/countdown-timer/useCountdownContext";

const useCountdownAlerts = () => {
  const { modalRef } = useCountdownContext();

  const alertUserOfTimerEnd = () => {
    modalRef.current?.showModal();
  };

  return { alertUserOfTimerEnd };
};

export default useCountdownAlerts;
