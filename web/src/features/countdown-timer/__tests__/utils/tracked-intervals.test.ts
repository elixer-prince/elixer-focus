import type { CompletedSession } from "@/features/countdown-timer/types/completed-session";
import type { TrackedInterval } from "@/features/countdown-timer/types/tracked-interval";
import {
  closeOpenTrackedIntervals,
  getTrackedTimeTotalsForRange,
  openTrackedInterval,
} from "@/features/countdown-timer/utils/tracked-intervals";

const makeInterval = (
  overrides: Partial<TrackedInterval> = {},
): TrackedInterval => ({
  id: "interval-1",
  kind: "idle",
  startedAt: 1_000,
  endedAt: null,
  sessionId: null,
  userId: null,
  createdAt: 1_000,
  updatedAt: 1_000,
  ...overrides,
});

describe("tracked interval helpers", () => {
  it("closes the previous interval before opening the next one", () => {
    const idle = makeInterval();

    const intervals = openTrackedInterval(
      [idle],
      "overrun",
      2_000,
      "session-1",
      "interval-2",
    );

    expect(intervals).toEqual([
      { ...idle, endedAt: 2_000, updatedAt: 2_000 },
      {
        id: "interval-2",
        kind: "overrun",
        startedAt: 2_000,
        endedAt: null,
        sessionId: "session-1",
        userId: null,
        createdAt: 2_000,
        updatedAt: 2_000,
      },
    ]);
  });

  it("normalizes multiple open intervals before opening another", () => {
    const idle = makeInterval();
    const overrun = makeInterval({
      id: "interval-2",
      kind: "overrun",
      startedAt: 2_000,
      createdAt: 2_000,
      updatedAt: 2_000,
      sessionId: "session-1",
    });

    const intervals = openTrackedInterval(
      [idle, overrun],
      "idle",
      3_000,
      null,
      "interval-3",
    );

    expect(intervals.slice(0, 2).map((interval) => interval.endedAt)).toEqual([
      3_000, 3_000,
    ]);
    expect(intervals.filter((interval) => interval.endedAt === null)).toEqual([
      expect.objectContaining({
        id: "interval-3",
        kind: "idle",
        startedAt: 3_000,
      }),
    ]);
  });

  it("does not create duplicate open intervals for the same tracking state", () => {
    const overrun = makeInterval({
      kind: "overrun",
      sessionId: "session-1",
    });

    expect(
      openTrackedInterval(
        [overrun],
        "overrun",
        2_000,
        "session-1",
        "interval-2",
      ),
    ).toEqual([overrun]);
  });

  it("clamps a backwards wall clock to a zero length interval", () => {
    const interval = makeInterval({ startedAt: 5_000, createdAt: 5_000 });

    expect(closeOpenTrackedIntervals([interval], 4_000)).toEqual([
      { ...interval, endedAt: 5_000, updatedAt: 5_000 },
    ]);
  });

  it("splits a cross midnight interval at local day boundaries", () => {
    const start = new Date(2026, 0, 1).getTime();
    const nextDay = new Date(2026, 0, 2).getTime();
    const dayAfter = new Date(2026, 0, 3).getTime();
    const interval = makeInterval({
      startedAt: new Date(2026, 0, 1, 23, 30).getTime(),
      endedAt: new Date(2026, 0, 2, 0, 30).getTime(),
    });

    const firstDay = getTrackedTimeTotalsForRange(
      [interval],
      [],
      start,
      nextDay,
      dayAfter,
    );
    const secondDay = getTrackedTimeTotalsForRange(
      [interval],
      [],
      nextDay,
      dayAfter,
      dayAfter,
    );

    expect(firstDay.idleSeconds).toBe(1_800);
    expect(secondDay.idleSeconds).toBe(1_800);
  });

  it("derives overrun totals from the linked session type", () => {
    const session: CompletedSession = {
      id: "session-1",
      sessionType: "Short Break",
      durationInSeconds: 300,
      completedAt: 1_000,
    };
    const overrun = makeInterval({
      kind: "overrun",
      sessionId: session.id,
      startedAt: 1_000,
      endedAt: 4_000,
    });

    const totals = getTrackedTimeTotalsForRange(
      [overrun],
      [session],
      0,
      5_000,
      5_000,
    );

    expect(totals.idleSeconds).toBe(0);
    expect(totals.overrunBySessionType).toEqual({
      Focus: 0,
      "Short Break": 3,
      "Long Break": 0,
    });
  });
});
