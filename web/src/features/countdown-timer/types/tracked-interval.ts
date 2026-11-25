export type TrackedIntervalKind = "idle" | "overrun";

export type TrackedInterval = {
  id: string;
  kind: TrackedIntervalKind;
  startedAt: number;
  endedAt: number | null;
  sessionId: string | null;
  userId: string | null;
  createdAt: number;
  updatedAt: number;
};
