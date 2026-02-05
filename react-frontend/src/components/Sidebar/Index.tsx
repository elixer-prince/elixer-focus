import { sidebarStyles } from "@components/Sidebar/styles.ts";
import SidebarLink from "@components/Sidebar/SidebarLink.tsx";

const Sidebar = () => {
    return (
        <nav className={sidebarStyles}>
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
