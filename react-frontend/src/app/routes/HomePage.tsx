import CountdownTimerContainer from "@features/countdown-timer/TimerContainer.tsx";
import AppLayout from "../layouts/AppLayout.tsx";

const HomePage = () => {
    return (
        <AppLayout>
            <CountdownTimerContainer />
        </AppLayout>
    );
};

export default HomePage;
