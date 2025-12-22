import LinkContainer from "@features/ui/Navigation/Sidebar/LinkContainer.tsx";
import NavLogo from "@features/ui/Navigation/NavLogo.tsx";

const Sidebar = () => {
    return (
        // Sidebar
        <nav className="bg-base-100 fixed top-0 bottom-0 w-(--sidebar-width) p-4">
            <div className="flex items-center justify-between">
                <NavLogo />
                <div className="hover:text-primary cursor-pointer transition-colors">
                    (close)
                </div>
            </div>

            <LinkContainer />
        </nav>
    );
};

export default Sidebar;
