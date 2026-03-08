import SidebarLink from "@/features/ui/navigation/Sidebar/Default/SidebarLink";
import {
  // MdAccountCircle,
  MdHomeFilled,
  // MdLibraryBooks,
  MdTaskAlt,
} from "react-icons/md";

const links = [
  {
    to: "/",
    icon: <MdHomeFilled size={20} />,
    label: "Home",
  },
  // {
  //   to: "/profile",
  //   icon: <MdAccountCircle size={20} />,
  //   label: "Profile",
  // },
  // {
  //   to: "/journal",
  //   icon: <MdLibraryBooks size={20} />,
  //   label: "Journal",
  // },
  {
    to: "/tasks",
    icon: <MdTaskAlt size={20} />,
    label: "Tasks",
  },
];

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <ul className="sidebar__list debug-border border-r-base-content/50 fixed top-(--navbar-height) bottom-0 hidden w-(--sidebar-width) flex-col overflow-y-auto border-r px-3 pt-6 select-none md:flex">
        {links.map((link) => (
          <li key={link.to}>
            <SidebarLink to={link.to}>
              {link.icon}
              {link.label}
            </SidebarLink>
          </li>
        ))}
        {/* <li>
          <SidebarLink to={"/profile"}>
            <MdAccountCircle size={20} />
            Profile
          </SidebarLink>
        </li> */}
        {/* <li>
          <SidebarLink to="/journal">
            <MdLibraryBooks size={20} />
            Journal
          </SidebarLink>
        </li> */}
      </ul>

      {/*<div className="mt-auto px-4 py-2">(Profile)</div>*/}
    </nav>
  );
};

export default Sidebar;
