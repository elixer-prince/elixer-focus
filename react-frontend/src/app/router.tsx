import { Route, Routes } from "react-router";
import Home from "@app/routes/Home";
import Settings from "@app/routes/Settings";
import Tasks from "@app/routes/Tasks.tsx";

const Router = () => {
    return (
        <Routes>
            <Route index element={<Home />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="settings" element={<Settings />} />
        </Routes>
    );
};

export default Router;
