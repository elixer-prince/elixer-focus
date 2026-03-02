import dayjs from "dayjs";
import { useEffect, useState } from "react";

const CurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(dayjs().format("h:mm:ss A"));

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs().format("h:mm:ss A"));
    }, 1000);

    // Cleanup when component unmounts
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="current-time hover:bg-base-content/10 border-primary/25 bg-base-100 rounded-md border-2 p-2 font-bold shadow-md transition-colors duration-500 select-none max-sm:hidden">
      {currentTime}
    </div>
  );
};

export default CurrentTime;
