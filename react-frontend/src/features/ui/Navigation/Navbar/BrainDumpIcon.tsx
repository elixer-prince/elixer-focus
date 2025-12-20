import { Link } from "react-router";
import { FiInbox } from "react-icons/fi";

const BrainDumpIcon = () => {
    return (
        <Link
            to="/bin"
            className="hover:text-primary transition-colors duration-300"
        >
            <FiInbox size={24} />
        </Link>
    );
};

export default BrainDumpIcon;
