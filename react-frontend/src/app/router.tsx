import { Route, Routes } from "react-router";
import Home from "@app/routes/Home";
import Settings from "@app/routes/Settings";

const Router = () => {
    return (
        <Routes>
            <Route index element={<Home />} />
            <Route path="settings" element={<Settings />} />
        </Routes>
    );
};

export default Router;
