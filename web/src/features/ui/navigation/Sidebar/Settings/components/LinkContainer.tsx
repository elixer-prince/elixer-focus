import SidebarLink from "@/features/ui/navigation/Sidebar/Link";
import { settingsLinks } from "@/features/ui/navigation/Sidebar/Settings/constants/links";

const LinkContainer = () => {
  return (
    <ul className="max-sm:hidden">
      {settingsLinks.map((link) => (
        <li key={link.name}>
          <SidebarLink to={link.path}>{link.name}</SidebarLink>
        </li>
      ))}
    </ul>
  );
};

export default LinkContainer;
