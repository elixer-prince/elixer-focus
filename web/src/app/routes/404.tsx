import { Link } from "react-router";
import usePageTitle from "@/hooks/usePageTitle";

const NotFound = () => {
  const { updatePageTitle } = usePageTitle();

  updatePageTitle("Elixer Focus - Not Found");

  // TODO: Style this page and 403 a bit better.
  // Both 404 and 403 should share the same layout.
  // I might have to create a new layout for Error pages.

  return (
    <main>
      <p>Error 404: Not Found</p>

      <Link to="/">Back to home...</Link>
    </main>
  );
};

export default NotFound;
