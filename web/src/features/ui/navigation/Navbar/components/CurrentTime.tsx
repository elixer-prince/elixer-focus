import { useCurrentTime } from "@/stores/date";

const CurrentTime = () => {
  const currentTime = useCurrentTime();

  return (
    <article
      aria-label="Current time display"
      className="current-time hover:bg-base-content/10 border-primary/25 bg-base-100 rounded-md border-2 p-2 font-bold shadow-md transition-colors duration-500 select-none max-sm:hidden"
    >
      {currentTime}
    </article>
  );
};

export default CurrentTime;
