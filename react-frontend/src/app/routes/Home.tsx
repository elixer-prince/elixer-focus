import CountdownTimerContainer from "@features/countdown-timer/Index.tsx";
import AppLayout from "@app/layouts/AppLayout";

const Home = () => {
    return (
        <AppLayout>
            <CountdownTimerContainer />
        </AppLayout>
    );
};

export default Home;
