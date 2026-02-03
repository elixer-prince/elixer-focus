import { Link } from "react-router";

const Step1 = () => {
    return (
        <div className={"flex flex-col items-center gap-8"}>
            <h1 className={"text-4xl font-bold"}>Welcome to Elixer Focus</h1>

            <Link
                className={"btn btn-soft btn-primary w-fit"}
                to={"/onboarding/step2"}
            >
                Start your journey!
            </Link>
        </div>
    );
};

export default Step1;
