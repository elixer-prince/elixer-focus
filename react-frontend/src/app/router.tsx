import { Route, Routes } from "react-router";
import HomePage from "./routes/HomePage.tsx";
import SettingsPage from "./routes/SettingsPage.tsx";

const Router = () => {
    return (
        <Routes>
            <Route index element={<HomePage />} />
            <Route path="settings" element={<SettingsPage />} />
        </Routes>
    );
};

export default Router;
