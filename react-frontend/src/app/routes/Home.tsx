import CountdownTimerContainer from "@features/countdown-timer/TimerContainer";
import AppLayout from "@app/layouts/AppLayout";

const Home = () => {
    return (
        <AppLayout>
            <CountdownTimerContainer />
        </AppLayout>
    );
};

export default Home;
