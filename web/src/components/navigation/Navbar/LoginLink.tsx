import { NavLink } from "react-router";

const LoginLink = () => {
  return (
    <NavLink to="/auth/login" className="login-link btn">
      Login
    </NavLink>
  );
};

export default LoginLink;
