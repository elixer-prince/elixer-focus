import { Link } from "react-router";

const LoginLink = () => {
  return (
    <Link to="/auth/login" className="btn">
      Login
    </Link>
  );
};

export default LoginLink;
