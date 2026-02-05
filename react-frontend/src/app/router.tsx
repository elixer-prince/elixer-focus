import NotFound from "@app/routes/404";
import Timer from "@app/routes/(ROOT)/Timer.tsx";
import { createBrowserRouter } from "react-router";
import DefaultLayout from "@app/layouts/Default.tsx";
import Journal from "@app/routes/(ROOT)/Journal.tsx";

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
            {
                path: "/journal",
                element: <Journal />,
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
    // {
    //     path: "/settings",
    //     element: <Settings />,
    //     children: [
    //         {
    //             path: "timer",
    //             element: <TimerSettings />,
    //         },
    //         {
    //             path: "themes",
    //             element: <ThemeSettings />,
    //         },
    //     ],
    // },
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
    // {
    //     path: "/onboarding",
    //     element: <Onboarding />,
    //     children: [
    //         {
    //             path: "step1",
    //             element: <Step1 />,
    //         },
    //         {
    //             path: "step2",
    //             element: <Step2 />,
    //         },
    //         {
    //             path: "step3",
    //             element: <Step3 />,
    //         },
    //         {
    //             path: "step4",
    //             element: <Step4 />,
    //         },
    //     ],
    // },
]);
