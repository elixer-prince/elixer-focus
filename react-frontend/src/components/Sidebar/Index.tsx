import SidebarLink from "@components/Sidebar/SidebarLink.tsx";
import { FaHome } from "react-icons/fa";
import { FaBook } from "react-icons/fa6";

const Sidebar = () => {
    return (
        <nav
            className={
                "border-base-content/50 fixed top-(--navbar-height) bottom-0 flex w-(--sidebar-width) flex-col border-r-2"
            }
        >
            <ul className={"space-y-2 overflow-y-scroll p-4 pr-1"}>
                <li>
                    <SidebarLink to={"/"}>
                        <FaHome size={16} />
                        Home
                    </SidebarLink>
                </li>
                <li>
                    <SidebarLink to="/journal">
                        <FaBook />
                        Journal
                    </SidebarLink>
                </li>
            </ul>

            {/*<div className={"mt-auto px-4 py-2"}>(Profile)</div>*/}
        </nav>
    );
};

export default Sidebar;
