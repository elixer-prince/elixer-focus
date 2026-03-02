import dayjs from "dayjs";

const CurrentTime = () => {
  const currentTime = dayjs().format("h:mm A");

  return (
    <div className="current-time border-primary/25 bg-base-100 rounded-md border-2 p-2 font-bold shadow-md max-sm:hidden">
      {currentTime}
    </div>
  );
};

export default CurrentTime;
