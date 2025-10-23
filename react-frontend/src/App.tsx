import { Route, Routes } from "react-router";
import MusicPlayer from "./components/MusicPlayer.tsx";
import Navbar from "./components/Navbar.tsx";
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
