import { CountdownTimerProvider } from "@/stores/CountdownTimerContext";
import type { PropsWithChildren } from "react";

const Provider = ({ children }: PropsWithChildren) => {
  return <CountdownTimerProvider>{children}</CountdownTimerProvider>;
};

export default Provider;
