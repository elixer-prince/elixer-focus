import { CountdownTimerProvider } from "@/stores/countdown-timer/CountdownContext.tsx";
import type { PropsWithChildren } from "react";

const Provider = ({ children }: PropsWithChildren) => {
  return <CountdownTimerProvider>{children}</CountdownTimerProvider>;
};

export default Provider;
