import TimerSection from "../components/CountdownTimer/TimerContainer.tsx";
import AppLayout from "./layout/AppLayout.tsx";

const HomePage = () => {
    return (
        <AppLayout>
            <TimerSection />
        </AppLayout>
    );
};

export default HomePage;
