import { Link } from "react-router";

const ForbiddenRoute = () => {
  return (
    <main>
      <p>Error 403: Forbidden</p>

      <Link to="/">Back to home...</Link>
    </main>
  );
};

export default ForbiddenRoute;
