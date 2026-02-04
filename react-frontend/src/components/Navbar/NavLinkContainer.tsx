import NavLink from "@components/Navbar/NavLink.tsx";

const NavLinkContainer = () => {
    return (
        // Navbar Link Container
        <ul className="hidden gap-4 md:flex">
            <li>
                <NavLink to="/calendar">Calendar</NavLink>
            </li>
            <li>
                <NavLink to="/tasks">Tasks</NavLink>
            </li>
            <li>
                <NavLink to="/timer">Timer</NavLink>
            </li>
        </ul>
    );
};

export default NavLinkContainer;
