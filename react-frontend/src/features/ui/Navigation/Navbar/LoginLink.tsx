import { Link } from "react-router";

const LoginLink = () => {
    return (
        <Link to="/login" className="hidden">
            Login
        </Link>
    );
};

export default LoginLink;
