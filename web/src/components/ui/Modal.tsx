import useCountdownContext from "@/hooks/countdown-timer/useCountdownContext";
import { usePreviousSessionType } from "@/stores/countdown-timer/session-store";

const Modal = () => {
  const previousSessionType = usePreviousSessionType();
  const { modalRef } = useCountdownContext();

  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box">
        <div>
          <h2 className="modal-header text-2xl font-bold">
            Your {previousSessionType} Session has ended!
          </h2>

          <p>00:00</p>
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
