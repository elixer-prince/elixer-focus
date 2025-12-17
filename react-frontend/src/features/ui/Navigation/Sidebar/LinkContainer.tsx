import SidebarLink from "@features/ui/Navigation/Sidebar/Link.tsx";

const LinkContainer = () => {
    return (
        // Sidebar Link Container
        <ul>
            <li>
                <SidebarLink to="/settings/themes">Themes</SidebarLink>
            </li>
            <li>
                <SidebarLink to="/settings/timer">Timer</SidebarLink>
            </li>
        </ul>
    );
};

export default LinkContainer;
