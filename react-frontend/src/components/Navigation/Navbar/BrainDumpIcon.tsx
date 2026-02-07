import { FiInbox } from "react-icons/fi";
import { NavLink } from "react-router";

const BrainDumpIcon = () => {
  return (
    <NavLink
      to="/bin"
      className={({ isActive }) =>
        `${
          isActive ? "text-primary" : ""
        } hover:text-primary transition-colors duration-300`.trim()
      }
    >
      <FiInbox size={24} />
    </NavLink>
  );
};

export default BrainDumpIcon;
