import { Link } from "react-router";

const Navbar = () => {
    return (
        <nav className="bg-base-300 sticky top-0 right-0 left-0 flex items-center justify-between p-4 pl-8">
            <ul>
                <li>
                    <Link className={"text-primary hover:underline"} to={"/"}>
                        Home
                    </Link>
                </li>
            </ul>

            <div>
                <Link className={"btn btn-primary rounded-md"} to={"/settings"}>
                    Settings
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
