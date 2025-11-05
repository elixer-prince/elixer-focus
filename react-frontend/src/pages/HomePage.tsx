import CountdownTimerContainer from "../components/CountdownTimer/Container.tsx";
import AppLayout from "./layout/AppLayout.tsx";

const HomePage = () => {
    return (
        <AppLayout>
            <CountdownTimerContainer />
        </AppLayout>
    );
};

export default HomePage;
