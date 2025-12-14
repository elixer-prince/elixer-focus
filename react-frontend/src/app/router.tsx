import { Route, Routes } from "react-router";
import Home from "@app/routes/Home";
import TimerSettings from "@app/routes/Settings/Timer.tsx";
import ThemeSettings from "@app/routes/Settings/Theme.tsx";
import Tasks from "@app/routes/Tasks.tsx";

const Router = () => {
    return (
        <Routes>
            <Route index element={<Home />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/settings/timer" element={<TimerSettings />} />
            <Route path="/settings/themes" element={<ThemeSettings />} />
        </Routes>
    );
};

export default Router;
