import useCountdownContext from "@/features/countdown-timer/hooks/useCountdownContext";
import useNotification from "@/features/countdown-timer/hooks/useNotification";

const useCountdownAlerts = () => {
  const { modalRef } = useCountdownContext();
  const { sendTimerEndNotification } = useNotification();

  const alertUserOfTimerEnd = () => {
    modalRef.current?.showModal();
    // Fire-and-forget: the notification may re-request permission asynchronously.
    void sendTimerEndNotification();
  };

  return { alertUserOfTimerEnd };
};

export default useCountdownAlerts;
