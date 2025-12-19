import { FiSettings } from "react-icons/fi";
import { Link } from "react-router";

const SettingsIcon = () => {
    return (
        <Link to="/settings/themes">
            <FiSettings size={24} />
        </Link>
    );
};

export default SettingsIcon;
