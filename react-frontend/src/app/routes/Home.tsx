import CountdownTimerContainer from "@features/CountdownTimer/Index.tsx";
import AppLayout from "@app/layouts/AppLayout";

const Home = () => {
    return (
        <AppLayout>
            <CountdownTimerContainer />
        </AppLayout>
    );
};

export default Home;
