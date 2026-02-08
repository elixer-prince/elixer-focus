import { MdChevronRight } from "react-icons/md";

const DropdownButton = () => {
  return (
    <div
      tabIndex={0}
      role={"button"}
      className={
        "btn btn-soft from-primary/10 btn-ghost border-b-primary/50 border-b bg-linear-to-t"
      }
    >
      Switch Session
      <MdChevronRight className={"rotate-90"} size={24} />
    </div>
  );
};

export default DropdownButton;
