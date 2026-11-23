import type { CountdownSession } from "@/features/countdown-timer/types/session";
import useCountdownContext from "@/features/countdown-timer/hooks/useCountdownContext";
import useNotification from "@/features/countdown-timer/hooks/useNotification";

const useCountdownAlerts = () => {
  const { modalRef } = useCountdownContext();
  const { sendTimerEndNotification } = useNotification();

  const alertUserOfTimerEnd = (sessionType: CountdownSession) => {
    modalRef.current?.showModal();
    // Fire-and-forget: the notification may re-request permission asynchronously.
    void sendTimerEndNotification(sessionType);
  };

  return { alertUserOfTimerEnd };
};

export default useCountdownAlerts;
