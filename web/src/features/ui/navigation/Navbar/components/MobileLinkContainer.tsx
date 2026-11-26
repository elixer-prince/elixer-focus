import MobileLink from "@/features/ui/navigation/Navbar/components/MobileLink";
import { defaultLinks } from "@/features/ui/navigation/Sidebar/Default/constants/links";

const MobileLinkContainer = () => {
  return (
    <ul className="w-full max-w-100 space-y-2">
      {defaultLinks.map(({ to, icon: Icon, label }) => (
        <li key={to}>
          <MobileLink to={to}>
            <Icon size={24} aria-hidden="true" focusable="false" />
            {label}
          </MobileLink>
        </li>
      ))}
    </ul>
  );
};

export default MobileLinkContainer;
