import { Link } from "react-router";

const Navbar = ({ appName }: { appName: string }) => {
    return (
        <nav>
            <a href={"#"}>
                <span className={"font-bold"}>{appName}</span>
            </a>
            <ul>
                <li>
                    <Link className={"text-blue-500 hover:underline"} to={"/"}>
                        Home
                    </Link>
                </li>
                <li>
                    <Link
                        className={"text-blue-500 hover:underline"}
                        to={"/tasks"}
                    >
                        Tasks
                    </Link>
                </li>
                <li>
                    <Link
                        className={"text-blue-500 hover:underline"}
                        to={"/settings"}
                    >
                        Settings
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
