import SimpleLayout from "@app/layouts/SimpleLayout.tsx";
import CountdownTimerContainer from "@features/CountdownTimer/Index.tsx";

const Timer = () => {
    return (
        <SimpleLayout>
            <CountdownTimerContainer />
        </SimpleLayout>
    );
};

export default Timer;
