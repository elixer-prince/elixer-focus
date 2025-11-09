import { Link } from "react-router";

const Navbar = () => {
    return (
        <nav className="bg-base-300 sticky top-0 right-0 left-0 z-20 flex items-center justify-between p-4 pl-8 transition-colors duration-1000">
            <div className="flex items-baseline gap-8">
                <div>
                    <Link to="/">
                        <span className="text-xl font-bold">Elixer Focus</span>
                    </Link>
                </div>
                <ul>
                    <li>
                        <Link
                            className={"text-primary hover:underline"}
                            to={"/tasks"}
                        >
                            Tasks
                        </Link>
                    </li>
                </ul>
            </div>

            <div>
                <Link className={"btn btn-soft btn-primary"} to={"/settings"}>
                    Settings
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
