import SidebarLink from "@/features/ui/navigation/Sidebar/Link";
import { settingsLinks } from "@/features/ui/navigation/Sidebar/Settings/constants/links";

const LinkContainer = () => {
  return (
    <ul className="max-sm:hidden">
      {settingsLinks.map((link) => (
        <li key={link.to}>
          <SidebarLink to={link.to}>
            {link.icon}
            {link.label}
          </SidebarLink>
        </li>
      ))}
    </ul>
  );
};

export default LinkContainer;
