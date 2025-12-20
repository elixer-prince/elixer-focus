import { FiSettings } from "react-icons/fi";
import { Link } from "react-router";

const SettingsIcon = () => {
    return (
        <Link to="/settings/themes" className={"hidden"}>
            <FiSettings size={24} />
        </Link>
    );
};

export default SettingsIcon;
