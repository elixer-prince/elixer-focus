import { Link } from "react-router";
import usePageTitle from "@/hooks/usePageTitle";

const NotFound = () => {
  const { displayNotFoundPageTitle } = usePageTitle();

  displayNotFoundPageTitle();

  return (
    <main>
      <p>Error 404: Not Found</p>

      <Link to="/">Back to home...</Link>
    </main>
  );
};

export default NotFound;
