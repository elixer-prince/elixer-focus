import { MdChevronRight } from "react-icons/md";
import { useLastCompletedSession } from "@/features/countdown-timer/stores/session-history-store";

const DropdownButton = () => {
  const lastCompletedSession = useLastCompletedSession();

  return (
    <button
      type="button"
      tabIndex={0}
      disabled={lastCompletedSession !== null}
      className="session-dropdown__toggle btn btn-soft from-primary/10 btn-ghost border-b-primary/50 border-b bg-linear-to-t"
    >
      Switch Session
      <MdChevronRight className={"rotate-90"} size={24} />
    </button>
  );
};

export default DropdownButton;
