import NavbarLink from "@components/Navbar/NavbarLink.tsx";

const SettingsIcon = () => {
    return (
        // <Link to="/settings/themes" className={"hidden"}>
        //     {/*<FiSettings size={24} />*/}
        // </Link>

        <NavbarLink to="/settings/timer">Settings</NavbarLink>
    );
};

export default SettingsIcon;
