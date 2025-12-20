import AuthLayout from "@app/layouts/AuthLayout.tsx";
import { Link } from "react-router";

const Login = () => {
    return (
        <AuthLayout>
            <p>Login Page...</p>
            <Link to="/">Back to home</Link>
        </AuthLayout>
    );
};

export default Login;
