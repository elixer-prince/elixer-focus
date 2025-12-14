import NavLink from "@features/ui/Navbar/NavLink.tsx";

const NavLinkContainer = () => {
    return (
        <ul className="hidden">
            <li>
                <NavLink to="/tasks">Tasks</NavLink>
            </li>
        </ul>
    );
};

export default NavLinkContainer;
