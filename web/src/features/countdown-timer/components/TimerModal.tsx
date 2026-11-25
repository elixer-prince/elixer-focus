import Modal from "@/components/ui/Modal";
import useCountdownContext from "@/features/countdown-timer/hooks/useCountdownContext";
import { usePreviousSessionType } from "@/features/countdown-timer/stores/session-store";
import { useEffect, useState } from "react";

const TimerModal = () => {
  const { modalRef } = useCountdownContext();
  const previousSessionType = usePreviousSessionType();

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

        <p className="text-base-content/60 mt-2 mb-3">
          Your session is recorded. Take a moment to reflect before continuing.
        </p>
      </div>
    </Modal>
  );
};

export default TimerModal;
