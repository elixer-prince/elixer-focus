import { Link } from "react-router";
import usePageTitle from "@/hooks/usePageTitle";

const NotFoundRoute = () => {
  const { updatePageTitle } = usePageTitle();

  updatePageTitle("Elixer Focus - Not Found");

  // Both 404 and 403 should share the same layout.
  // I might have to create a new layout for Error pages.

  return (
    <main>
      <p>Error 404: Not Found</p>

      <Link to="/">Back to home...</Link>
    </main>
  );
};

export default NotFoundRoute;
