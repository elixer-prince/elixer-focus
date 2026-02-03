import { Link } from "react-router";

const Step2 = () => {
    return (
        <div className={"flex flex-col items-center"}>
            <div>
                <h1 className={"text-2xl font-bold"}>
                    What time do you wish to sleep?
                </h1>

                <div className={"flex gap-4"}>
                    <div>
                        <label htmlFor="sleepTime">Sleep Time</label>
                        <input
                            id={"sleepTime"}
                            type="time"
                            className={"input"}
                        />
                    </div>
                    <div>
                        <label htmlFor="wakeTime">Wake Time</label>
                        <input
                            id={"wakeTime"}
                            type="time"
                            className={"input"}
                            disabled
                        />
                    </div>
                </div>
            </div>

            <div className={"flex gap-2"}>
                <Link className={"btn"} to={"/onboarding/step1"}>
                    Back
                </Link>
                <Link className={"btn"} to={"/onboarding/step3"}>
                    Next
                </Link>
            </div>
        </div>
    );
};

export default Step2;
