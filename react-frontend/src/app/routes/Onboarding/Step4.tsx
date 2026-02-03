import { Link } from "react-router";

const Step4 = () => {
    return (
        <div>
            <h1 className={"text-2xl font-bold"}>Step 4</h1>

            <div>
                <Link className={"btn"} to={"/onboarding/step3"}>
                    Back
                </Link>
            </div>
        </div>
    );
};

export default Step4;
