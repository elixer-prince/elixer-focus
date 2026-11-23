import Modal from "@/components/ui/Modal";
import useCountdownContext from "@/features/countdown-timer/hooks/useCountdownContext";
import { usePreviousSessionType } from "@/features/countdown-timer/stores/session-store";
import { useElapsedTimeInSeconds } from "@/features/countdown-timer/stores/countdown-store";
import { formatElapsedTime } from "@/utils/formatting";
import { useEffect, useState } from "react";

const TimerModal = () => {
  const { modalRef } = useCountdownContext();
  const previousSessionType = usePreviousSessionType();
  const elapsedTimeInSeconds = useElapsedTimeInSeconds();

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const dialog = modalRef.current;
    if (!dialog) return;

    function checkOpen() {
      if (dialog) {
        setIsOpen(dialog.open);
      }
    }

    checkOpen();
    dialog.addEventListener("toggle", checkOpen);
    return () => {
      dialog.removeEventListener("toggle", checkOpen);
    };
  }, [modalRef]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => modalRef.current?.close()}
      ref={modalRef}
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold">
          Your <span className="text-primary">{previousSessionType}</span>{" "}
          Session has ended!
        </h2>

        <p className="elapsed-paragraph mt-2 mb-3 font-bold">
          You went over by{" "}
          <span className="elapsed-time text-error text-2xl">
            {formatElapsedTime(elapsedTimeInSeconds)}
          </span>
          .
        </p>
      </div>
    </Modal>
  );
};

export default TimerModal;
