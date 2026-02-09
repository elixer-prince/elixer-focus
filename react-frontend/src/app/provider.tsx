import { CountdownTimerProvider } from "@/stores/countdown-timer/Context.tsx";
import type { PropsWithChildren } from "react";

const Provider = ({ children }: PropsWithChildren) => {
  return <CountdownTimerProvider>{children}</CountdownTimerProvider>;
};

export default Provider;
