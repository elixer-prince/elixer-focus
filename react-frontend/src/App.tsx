import { Route, Routes } from "react-router";
// COMPONENTS
import Navbar from "./components/Navbar.tsx";
// PAGES
import HomePage from "./pages/HomePage.tsx";
import TasksPage from "./pages/TasksPage.tsx";

const appName = "Elixer Focus";

const App = () => {
    return (
        <>
            <Navbar appName={appName} />
            <Routes>
                <Route path={"/"} element={<HomePage />} />
                <Route path={"/tasks"} element={<TasksPage />} />
            </Routes>
            <MusicPlayer />
        </>
    );
};

export default App;
