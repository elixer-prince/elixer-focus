import { Outlet } from "react-router";

const ErrorLayout = () => {
  return (
    <main>
      [Error Layout]
      <Outlet />
    </main>
  );
};

export default ErrorLayout;
