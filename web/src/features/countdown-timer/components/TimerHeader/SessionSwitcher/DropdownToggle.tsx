import { MdChevronRight } from "react-icons/md";

const DropdownButton = () => {
  return (
    <button
      tabIndex={0}
      className="session-dropdown__toggle btn btn-soft from-primary/10 btn-ghost border-b-primary/50 border-b bg-linear-to-t"
    >
      Switch Session
      <MdChevronRight className={"rotate-90"} size={24} />
    </button>
  );
};

export default DropdownButton;
