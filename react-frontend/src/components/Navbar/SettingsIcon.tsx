import NavLink from "@components/Navbar/NavLink.tsx";

const SettingsIcon = () => {
    return (
        // <Link to="/settings/themes" className={"hidden"}>
        //     {/*<FiSettings size={24} />*/}
        // </Link>

        <NavLink to="/settings/timer">Settings</NavLink>
    );
};

export default SettingsIcon;
