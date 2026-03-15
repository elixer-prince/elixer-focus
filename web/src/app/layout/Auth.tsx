import { Outlet } from "react-router";

const AuthLayout = () => {
  return (
    <>
      <p>Auth Layout</p>
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default AuthLayout;
