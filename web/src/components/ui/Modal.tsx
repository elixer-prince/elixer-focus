import useCountdownContext from "@/hooks/countdown-timer/useCountdownContext";
import { usePreviousSessionType } from "@/stores/countdown-timer/session-store";
import { useElapsedTimeInSeconds } from "@/stores/countdown-timer/store";
import { formatTimeInMinutesAndSeconds } from "@/utils/formatting";

const Modal = () => {
  const { modalRef } = useCountdownContext();

  const previousSessionType = usePreviousSessionType();
  const elapsedTimeInSeconds = useElapsedTimeInSeconds();

  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box">
        <div>
          <h2 className="modal-header text-2xl font-bold">
            Your {previousSessionType} Session has ended!
          </h2>

          <p>
            Elapsed Time:{" "}
            <span className="text-error">
              {formatTimeInMinutesAndSeconds(elapsedTimeInSeconds)}
            </span>
          </p>
        </div>

        <div className="">
          <form method="dialog">
            <button className="btn">Close</button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default Modal;
