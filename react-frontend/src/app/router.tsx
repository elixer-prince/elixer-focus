import NotFound from "@app/routes/404.tsx";
import Login from "@app/routes/Auth/Login.tsx";
import SignUp from "@app/routes/Auth/SignUp.tsx";
import Bin from "@app/routes/Bin.tsx";
import Calendar from "@app/routes/Calendar.tsx";
import Home from "@app/routes/Home";
import ThemeSettings from "@app/routes/Settings/Theme.tsx";
import TimerSettings from "@app/routes/Settings/Timer.tsx";
import Tasks from "@app/routes/Tasks.tsx";
import Timer from "@app/routes/Timer.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
        errorElement: <NotFound />,
    },
    {
        path: "/tasks",
        element: <Tasks />,
    },
    {
        path: "/timer",
        element: <Timer />,
    },
    {
        path: "/calendar",
        element: <Calendar />,
    },
    {
        path: "/bin",
        element: <Bin />,
    },
    {
        path: "/settings/timer",
        element: <TimerSettings />,
    },
    {
        path: "/settings/themes",
        element: <ThemeSettings />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/signup",
        element: <SignUp />,
    },
]);

const Router = () => {
    return <RouterProvider router={router} />;
};

export default Router;
