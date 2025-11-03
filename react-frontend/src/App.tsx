import { Route, Routes } from "react-router";
// COMPONENTS
// import Navbar from "./components/Navbar.tsx";
// PAGES
import HomePage from "./pages/HomePage.tsx";
// import TasksPage from "./pages/TasksPage.tsx";
// import SettingsPage from "./pages/SettingsPage.tsx";

const App = () => {
    return (
        <>
            {/* <Navbar appName={appName} /> */}
            <Routes>
                <Route path={"/"} element={<HomePage />} />
                {/* <Route path={"/tasks"} element={<TasksPage />} /> */}
                {/* <Route path={"/settings"} element={<SettingsPage />} /> */}
            </Routes>
            {/*<MusicPlayer />*/}
        </>
    );
};

export default App;
