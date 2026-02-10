import Home from "@/app/routes/(root)/Index";
import Journal from "@/app/routes/(root)/Journal";
import Profile from "@/app/routes/(root)/Profile";
import Tasks from "@/app/routes/(root)/Tasks";
import NotFound from "@/app/routes/404";
import Login from "@/app/routes/auth/Login";
import SignUp from "@/app/routes/auth/SignUp";
import AuthLayout from "@/components/layout/Auth";
import DefaultLayout from "@/components/layout/Default";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "journal",
        element: <Journal />,
      },
      {
        path: "tasks",
        element: <Tasks />,
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <SignUp />,
      },
    ],
  },
]);
