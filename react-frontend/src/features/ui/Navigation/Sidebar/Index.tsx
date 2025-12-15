import NavLogo from "@features/ui/Navigation/NavLogo.tsx";
import SidebarLink from "@features/ui/Navigation/Sidebar/Link.tsx";

const Sidebar = () => {
    return (
        <nav className="bg-base-300 fixed top-0 bottom-0 w-(--sidebar-width) px-2 py-4">
            <NavLogo />

            <ul>
                <li>
                    <SidebarLink to="/settings/themes">Themes</SidebarLink>
                </li>
                <li>
                    <SidebarLink to="/settings/timer">Timer</SidebarLink>
                </li>
            </ul>
        </nav>
    );
};

export default Sidebar;
