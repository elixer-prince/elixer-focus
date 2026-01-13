import { Link, useLocation } from "react-router";
import { FiInbox } from "react-icons/fi";

const BrainDumpIcon = () => {
    const location = useLocation();

    return (
        <Link
            to="/bin"
            className={`${location.pathname === "/bin" ? "text-primary" : ""} hover:text-primary transition-colors duration-300`.trim()}
        >
            <FiInbox size={24} />
        </Link>
    );
};

export default BrainDumpIcon;
