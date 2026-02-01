import NotFound from "@app/routes/404";
import ThemeSettings from "@app/routes/Settings/Theme.tsx";
import TimerSettings from "@app/routes/Settings/Timer.tsx";
import Timer from "@app/routes/Timer.tsx";
import { createBrowserRouter } from "react-router";
import DefaultLayout from "./layouts/DefaultLayout";
import SettingsLayout from "./layouts/SettingsLayout";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <DefaultLayout />,
        errorElement: <NotFound />,
        children: [
            {
                path: "/",
                element: <Timer />,
            },
            // {
            //     path: "/tasks",
            //     element: <Tasks />,
            // },
            // {
            //     path: "/timer",
            //     element: <Timer />,
            // },
            // {
            //     path: "/calendar",
            //     element: <Calendar />,
            // },
            // {
            //     path: "/bin",
            //     element: <Bin />,
            // },
        ],
    },
    {
        path: "/settings",
        element: <SettingsLayout />,
        children: [
            {
                path: "timer",
                element: <TimerSettings />,
            },
            {
                path: "themes",
                element: <ThemeSettings />,
            },
        ],
    },
    // {
    //     path: "/",
    //     element: <AuthLayout />,
    //     children: [
    //         {
    //             path: "/login",
    //             element: <Login />,
    //         },
    //         {
    //             path: "/signup",
    //             element: <SignUp />,
    //         },
    //     ],
    // },
]);
