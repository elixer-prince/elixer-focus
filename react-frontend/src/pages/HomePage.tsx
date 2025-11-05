import AppLayout from "./layout/AppLayout.tsx";
import TimerSection from "../components/CountdownTimer/TimerSection.tsx";

const HomePage = () => {
    return (
        <AppLayout>
            <TimerSection />
        </AppLayout>
    );
};

export default HomePage;
