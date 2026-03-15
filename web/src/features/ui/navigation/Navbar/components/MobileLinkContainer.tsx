import MobileLink from "@/features/ui/navigation/Navbar/components/MobileLink";
import { MdHomeFilled, MdTaskAlt } from "react-icons/md";

const MobileLinkContainer = () => {
  return (
    <ul className="w-full max-w-100 space-y-2">
      <li>
        <MobileLink to="/">
          <MdHomeFilled size={24} />
          Home
        </MobileLink>
      </li>
      <li>
        <MobileLink to="/tasks">
          <MdTaskAlt size={24} />
          Tasks
        </MobileLink>
      </li>
    </ul>
  );
};

export default MobileLinkContainer;
