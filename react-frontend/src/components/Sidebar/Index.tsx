import { sidebarStyles } from "@components/Sidebar/styles.ts";
import Link from "@components/Sidebar/NavLink.tsx";

const Sidebar = () => {
    return (
        <nav className={sidebarStyles}>
            <ul className={"space-y-2 overflow-y-scroll p-4"}>
                <li>
                    <Link to="/journal">Journal</Link>
                </li>
                <li>
                    <Link to={"/"}>Link 2</Link>
                </li>
            </ul>

            <div className={"mt-auto px-4 py-2"}>(Profile)</div>
        </nav>
    );
};

export default Sidebar;
