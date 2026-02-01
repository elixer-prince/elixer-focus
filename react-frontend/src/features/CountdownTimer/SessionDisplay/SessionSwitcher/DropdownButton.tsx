import { FiChevronDown } from "react-icons/fi";

const DropdownButton = () => {
    return (
        <div tabIndex={0} role={"button"} className={"btn btn-soft btn-ghost"}>
            Switch Session
            <FiChevronDown size={20} />
        </div>
    );
};

export default DropdownButton;
