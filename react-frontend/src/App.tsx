import { Route, Routes } from "react-router";
import HomePage from "./pages/HomePage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";

const App = () => {
    return (
        <Routes>
            <Route index element={<HomePage />} />
            <Route path="settings" element={<SettingsPage />} />
        </Routes>
    );
};

export default App;
