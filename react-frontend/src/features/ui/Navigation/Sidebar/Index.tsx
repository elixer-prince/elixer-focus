import NavLogo from "@features/ui/Navigation/NavLogo.tsx";
import LinkContainer from "@features/ui/Navigation/Sidebar/LinkContainer.tsx";

const Sidebar = () => {
    return (
        // Sidebar
        <nav className="bg-base-300 fixed top-0 bottom-0 w-(--sidebar-width) px-2 py-4">
            <NavLogo />
            <LinkContainer />
        </nav>
    );
};

export default Sidebar;
