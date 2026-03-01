import useCountdownContext from "@/features/countdown-timer/hooks/useCountdownContext";
import { usePreviousSessionType } from "@/features/countdown-timer/stores/session-store";
import { useElapsedTimeInSeconds } from "@/features/countdown-timer/stores/countdown-store";
import { formatTimeInMinutesAndSeconds } from "@/utils/formatting";

const Modal = () => {
  const { modalRef } = useCountdownContext();

  const previousSessionType = usePreviousSessionType();
  const elapsedTimeInSeconds = useElapsedTimeInSeconds();

  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box">
        <div className="text-center">
          <h2 className="modal-header text-2xl font-bold">
            Your <span className="text-primary">{previousSessionType}</span>{" "}
            Session has ended!
          </h2>

          <p className="elapsed-paragraph mt-2 mb-3 font-bold">
            You went over by{" "}
            <span className="elapsed-time text-error text-2xl">
              {formatTimeInMinutesAndSeconds(elapsedTimeInSeconds)}
            </span>{" "}
            minutes.
          </p>
        </div>

        <div className="flex justify-center">
          <form method="dialog">
            <button className="btn">Close</button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default Modal;
