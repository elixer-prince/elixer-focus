import CountdownTimerContainer from "@features/CountdownTimer/components/Index.tsx";
// import Tasks from "@features/Tasks/components/Index.tsx";

const Home = () => {
    return (
        <div className={"flex justify-center gap-8"}>
            <CountdownTimerContainer />
            {/* <Tasks /> */}
        </div>
    );
};

export default Home;
