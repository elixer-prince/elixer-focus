import { Outlet } from "react-router";

const Onboarding = () => {
    return (
        <main className={"flex min-h-screen items-center justify-center"}>
            <Outlet />
        </main>
    );
};

export default Onboarding;
