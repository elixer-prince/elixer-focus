import CountdownTimerContainer from "@/features/countdown-timer/components/Index.tsx";
// import tasks from "@/features/tasks/components/Index.tsx";

const Home = () => {
  return (
    <div className={"flex justify-center gap-8"}>
      <CountdownTimerContainer />
      {/* <tasks /> */}
    </div>
  );
};

export default Home;
