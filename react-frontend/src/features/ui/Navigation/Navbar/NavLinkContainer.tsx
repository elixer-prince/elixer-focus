import NavLink from "@features/ui/Navigation/Navbar/NavLink.tsx";

const NavLinkContainer = () => {
    return (
        // Navbar Link Container
        <ul className="hidden">
            <li>
                <NavLink to="/tasks">Tasks</NavLink>
            </li>
        </ul>
    );
};

export default NavLinkContainer;
