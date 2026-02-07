import { Link } from "react-router";

const Forbidden = () => {
  return (
    <main>
      <p>Error 403: Forbidden</p>

      <Link to="/">Back to home...</Link>
    </main>
  );
};

export default Forbidden;
