import SidebarLink from "@/components/navigation/Sidebar/SidebarLink";
import {
  // MdAccountCircle,
  MdHomeFilled,
  MdLibraryBooks,
  // MdTaskAlt,
} from "react-icons/md";

const Sidebar = () => {
  return (
    <nav className="sidebar border-r-base-content/50 fixed top-(--navbar-height) bottom-0 hidden w-(--sidebar-width) flex-col border-r pl-1.5 select-none md:flex">
      <ul className={"overflow-y-scroll pt-6 pl-2"}>
        <li>
          <SidebarLink to={"/"}>
            <MdHomeFilled size={20} />
            Home
          </SidebarLink>
        </li>
        {/* <li>
          <SidebarLink to={"/profile"}>
            <MdAccountCircle size={20} />
            Profile
          </SidebarLink>
        </li> */}
        <li>
          <SidebarLink to="/journal">
            <MdLibraryBooks size={20} />
            Journal
          </SidebarLink>
        </li>
        {/* <li>
          <SidebarLink to="/tasks">
            <MdTaskAlt size={20} />
            Tasks
          </SidebarLink>
        </li> */}
      </ul>

      {/*<div className={"mt-auto px-4 py-2"}>(Profile)</div>*/}
    </nav>
  );
};

export default Sidebar;
