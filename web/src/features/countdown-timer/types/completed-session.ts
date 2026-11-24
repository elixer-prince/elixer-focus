import type { CountdownSession } from "@/features/countdown-timer/types/session";

export type CompletedSession = {
  id: string;
  sessionType: CountdownSession;
  durationInSeconds: number;
  completedAt: number;
};
