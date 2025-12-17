import Login from "@app/routes/Auth/Login.tsx";
import SignUp from "@app/routes/Auth/SignUp.tsx";
import Home from "@app/routes/Home";
import ThemeSettings from "@app/routes/Settings/Theme.tsx";
import TimerSettings from "@app/routes/Settings/Timer.tsx";
import Tasks from "@app/routes/Tasks.tsx";
import { Route, Routes } from "react-router";

const Router = () => {
    return (
        <Routes>
            <Route index element={<Home />} />
            <Route path="/tasks" element={<Tasks />} />

            {/* Settings Routes */}
            <Route path="/settings/timer" element={<TimerSettings />} />
            <Route path="/settings/themes" element={<ThemeSettings />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
        </Routes>
    );
};

export default Router;
