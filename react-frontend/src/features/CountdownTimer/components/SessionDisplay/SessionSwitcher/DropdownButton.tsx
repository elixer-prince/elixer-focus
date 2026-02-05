import { FiChevronDown } from "react-icons/fi";
import { dropdownButtonStyles } from "@features/CountdownTimer/components/SessionDisplay/styles.ts";

const DropdownButton = () => {
    return (
        <div tabIndex={0} role={"button"} className={dropdownButtonStyles}>
            Switch Session
            <FiChevronDown size={20} />
        </div>
    );
};

export default DropdownButton;
