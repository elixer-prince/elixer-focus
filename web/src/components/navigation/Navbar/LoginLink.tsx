import { NavLink } from "react-router";

const LoginLink = () => {
  return (
    <NavLink to="/auth/login" className="btn">
      Login
    </NavLink>
  );
};

export default LoginLink;
