import AuthLayout from "@/app/layouts/Auth";
import DefaultLayout from "@/app/layouts/Default";
import Home from "@/app/routes/(ROOT)/Index";
import Journal from "@/app/routes/(ROOT)/Journal";
import Profile from "@/app/routes/(ROOT)/Profile";
import Tasks from "@/app/routes/(ROOT)/Tasks";
import NotFound from "@/app/routes/404";
import Login from "@/app/routes/Auth/Login";
import SignUp from "@/app/routes/Auth/SignUp";
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
