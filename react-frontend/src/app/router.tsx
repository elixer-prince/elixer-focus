import Login from "@app/routes/Auth/Login.tsx";
import SignUp from "@app/routes/Auth/SignUp.tsx";
import Home from "@app/routes/Home";
import ThemeSettings from "@app/routes/Settings/Theme.tsx";
import TimerSettings from "@app/routes/Settings/Timer.tsx";
import Tasks from "@app/routes/Tasks.tsx";
import { Route, Routes } from "react-router";
import Calendar from "@app/routes/Calendar.tsx";
import Timer from "@app/routes/Timer.tsx";

const Router = () => {
    return (
        <Routes>
            <Route index element={<Home />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/timer" element={<Timer />} />
            <Route path="/calendar" element={<Calendar />} />

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
