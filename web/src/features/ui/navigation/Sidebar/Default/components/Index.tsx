import { defaultLinks } from "@/features/ui/navigation/Sidebar/Default/constants/links";
import SidebarLink from "@/features/ui/navigation/Sidebar/Link";

const Sidebar = () => {
  return (
    // Default Sidebar
    <nav>
      <ul className="border-r-base-content/50 fixed top-(--navbar-height) bottom-0 hidden w-(--sidebar-width) flex-col overflow-y-auto border-r px-3 pt-6 select-none md:flex">
        {defaultLinks.map((link) => (
          <li key={link.to}>
            <SidebarLink to={link.to}>
              {link.icon}
              {link.label}
            </SidebarLink>
          </li>
        ))}
      </ul>

      {/*<div className="mt-auto px-4 py-2">(Profile)</div>*/}
    </nav>
  );
};

export default Sidebar;
