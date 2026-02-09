import { Link } from "react-router";

const Step3 = () => {
  return (
    <>
      <h1 className={"text-2xl font-bold"}>Step 3</h1>

      <div>
        <Link className={"btn"} to={"/onboarding/step2"}>
          Back
        </Link>
        <Link className={"btn"} to={"/onboarding/step4"}>
          Next
        </Link>
      </div>
    </>
  );
};

export default Step3;
