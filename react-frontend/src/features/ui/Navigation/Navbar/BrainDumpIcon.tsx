import { Link } from "react-router";
import { FiInbox } from "react-icons/fi";

const BrainDumpIcon = () => {
    return (
        <Link to="/bin" className="">
            <FiInbox size={24} />
        </Link>
    );
};

export default BrainDumpIcon;
