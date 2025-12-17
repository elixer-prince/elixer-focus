import SimpleLayout from "@app/layouts/SimpleLayout.tsx";
import CountdownTimerContainer from "@features/CountdownTimer/Index.tsx";

const Home = () => {
    return (
        <SimpleLayout>
            <CountdownTimerContainer />
        </SimpleLayout>
    );
};

export default Home;
