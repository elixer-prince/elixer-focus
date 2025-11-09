import NavLink from "@features/ui/navbar/NavLink.tsx";

const NavLinkContainer = () => {
    return (
        <ul>
            <li>
                <NavLink to="/tasks">Tasks</NavLink>
            </li>
        </ul>
    );
};

export default NavLinkContainer;
