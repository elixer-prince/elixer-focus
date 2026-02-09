import { Link } from "react-router";

const NavLogo = ({ className }: { className?: string }) => {
  return (
    <Link to={"/"} className={`${className} select-none`.trim()}>
      <span className={"inline-block text-xl font-bold"}>
        Elixer Focus <sub className={"text-[0.5rem]"}>TM</sub>
      </span>
    </Link>
  );
};

export default NavLogo;
