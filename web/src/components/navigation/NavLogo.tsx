import { Link } from "react-router";

const NavLogo = ({ className }: { className?: string }) => {
  return (
    <Link to={"/"} className={`${className} select-none`.trim()}>
      <span className={"inline-block text-xl font-bold"}>Elixer Focus</span>
    </Link>
  );
};

export default NavLogo;
