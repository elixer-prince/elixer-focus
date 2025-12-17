import { Link } from "react-router";

const NotFound = () => {
    return (
        <main>
            <p>Error 404: Not Found</p>

            <Link to="/">Back to home...</Link>
        </main>
    );
};

export default NotFound;
