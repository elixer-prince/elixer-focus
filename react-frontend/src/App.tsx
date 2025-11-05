import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage.tsx";

const App = () => {
    return (
        <Routes>
            <Route index element={<HomePage />} />
        </Routes>
    );
};

export default App;
