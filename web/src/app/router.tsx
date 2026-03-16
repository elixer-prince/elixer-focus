import AuthLayout from "@/app/layout/Auth";
import DefaultLayout from "@/app/layout/Default";
import SettingsLayout from "@/app/layout/Settings";
import HomeRoute from "@/app/routes/(root)/Index";
import JournalRoute from "@/app/routes/(root)/Journal";
import ProfileRoute from "@/app/routes/(root)/Profile";
import TasksRoute from "@/app/routes/(root)/Tasks";
import NotFoundRoute from "@/app/routes/404";
import LoginRoute from "@/app/routes/auth/Login";
import SignUpRoute from "@/app/routes/auth/SignUp";
import ThemeRoute from "@/app/routes/settings/Theme";
import TimerRoute from "@/app/routes/settings/Timer";
import { createBrowserRouter } from "react-router";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultLayout />,
    errorElement: <NotFoundRoute />,
    children: [
      {
        path: "",
        element: <HomeRoute />,
      },
      {
        path: "profile",
        element: <ProfileRoute />,
      },
      {
        path: "journal",
        element: <JournalRoute />,
      },
      {
        path: "tasks",
        element: <TasksRoute />,
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginRoute />,
      },
      {
        path: "signup",
        element: <SignUpRoute />,
      },
    ],
  },
  {
    path: "/settings",
    element: <SettingsLayout />,
    children: [
      {
        path: "",
        element: <ProfileRoute />,
      },
      {
        path: "themes",
        element: <ThemeRoute />,
      },
      {
        path: "timer",
        element: <TimerRoute />,
      },
    ],
  },
]);
