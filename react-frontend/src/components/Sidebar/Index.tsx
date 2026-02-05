import SidebarLink from "@components/Sidebar/SidebarLink.tsx";

const Sidebar = () => {
    return (
        <nav
            className={
                "border-base-content/50 fixed top-(--navbar-height) bottom-0 flex w-(--sidebar-width) flex-col border-r-2"
            }
        >
            <ul className={"space-y-2 overflow-y-scroll p-4"}>
                <li>
                    <SidebarLink to={"/"}>Home</SidebarLink>
                </li>
                <li>
                    <SidebarLink to="/journal">Journal</SidebarLink>
                </li>
            </ul>

            <div className={"mt-auto px-4 py-2"}>(Profile)</div>
        </nav>
    );
};

export default Sidebar;
