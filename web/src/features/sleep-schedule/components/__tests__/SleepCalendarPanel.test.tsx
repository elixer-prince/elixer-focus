import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { addDays } from "date-fns";
import SleepCalendarPanel from "@/features/sleep-schedule/components/SleepCalendarPanel";
import { formatLocalDate } from "@/features/calendar/utils/calendar-date";
import { initialSleepScheduleData } from "@/features/sleep-schedule/types/sleep-schedule";
import { useSleepScheduleStore } from "@/stores";

const currentTime = new Date(2026, 10, 26, 12);
const today = formatLocalDate(currentTime);
const yesterday = formatLocalDate(addDays(currentTime, -1));

beforeEach(() => {
  vi.spyOn(Date, "now").mockReturnValue(currentTime.getTime());
  localStorage.clear();
  useSleepScheduleStore.setState(initialSleepScheduleData);
  let id = 0;
  vi.stubGlobal("crypto", { randomUUID: () => `sleep-${++id}` });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Sleep Calendar panel", () => {
  it("explains unavailable planned totals when the wake time is unset", () => {
    render(
      <SleepCalendarPanel
        selectedDate={today}
        currentTime={currentTime}
        showAwakeTotals
        awakeTotals={[{ date: today, idleSeconds: null }]}
      />,
    );

    expect(screen.getByText(/No valid wake time is set/)).toBeInTheDocument();
    expect(screen.getByText("Unavailable")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Record wake time now" }),
    ).toBeDisabled();
    expect(screen.getByText(/Record a bedtime first/)).toBeInTheDocument();
  });

  it("records a past bedtime using the selected local date and time", async () => {
    render(
      <SleepCalendarPanel
        selectedDate={yesterday}
        currentTime={currentTime}
        showAwakeTotals={false}
        awakeTotals={[]}
      />,
    );

    fireEvent.change(screen.getByLabelText(`Bedtime for ${yesterday}`), {
      target: { value: "22:30" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Record bedtime" }));

    await waitFor(() => {
      expect(useSleepScheduleStore.getState().actualRecords).toHaveLength(1);
    });
    const record = useSleepScheduleStore.getState().actualRecords[0];
    expect(record.sleepDate).toBe(yesterday);
    expect(new Date(record.bedAt).getHours()).toBe(22);
    expect(new Date(record.bedAt).getMinutes()).toBe(30);
  });

  it("records a wake on the latest earlier incomplete bedtime", async () => {
    useSleepScheduleStore.setState({
      ...initialSleepScheduleData,
      actualRecords: [
        {
          id: "night-1",
          sleepDate: yesterday,
          bedAt: new Date(2026, 10, 25, 22).getTime(),
          wakeAt: null,
        },
      ],
    });
    render(
      <SleepCalendarPanel
        selectedDate={today}
        currentTime={currentTime}
        showAwakeTotals={false}
        awakeTotals={[]}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Record wake time now" }),
    );

    await waitFor(() => {
      expect(useSleepScheduleStore.getState().actualRecords[0].wakeAt).toBe(
        currentTime.getTime(),
      );
    });
    expect(screen.getByText(/14 hr sleep/)).toBeInTheDocument();
  });

  it("corrects past bedtime and wake timestamps", async () => {
    useSleepScheduleStore.setState({
      ...initialSleepScheduleData,
      actualRecords: [
        {
          id: "night-1",
          sleepDate: yesterday,
          bedAt: new Date(2026, 10, 25, 19).getTime(),
          wakeAt: new Date(2026, 10, 25, 23).getTime(),
        },
      ],
    });
    render(
      <SleepCalendarPanel
        selectedDate={yesterday}
        currentTime={currentTime}
        showAwakeTotals={false}
        awakeTotals={[]}
      />,
    );

    fireEvent.change(screen.getByLabelText(`Bedtime for ${yesterday}`), {
      target: { value: "20:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Correct bedtime" }));
    await waitFor(() => {
      expect(useSleepScheduleStore.getState().actualRecords[0].bedAt).toBe(
        new Date(2026, 10, 25, 20).getTime(),
      );
    });

    fireEvent.change(screen.getByLabelText(`Wake time for ${yesterday}`), {
      target: { value: "22:30" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Correct wake time" }));
    await waitFor(() => {
      expect(useSleepScheduleStore.getState().actualRecords[0].wakeAt).toBe(
        new Date(2026, 10, 25, 22, 30).getTime(),
      );
    });
    expect(screen.getByText(/2 hr 30 min sleep/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear wake time" }));
    await waitFor(() => {
      expect(useSleepScheduleStore.getState().actualRecords).toEqual([
        {
          id: "night-1",
          sleepDate: yesterday,
          bedAt: new Date(2026, 10, 25, 20).getTime(),
          wakeAt: null,
        },
      ]);
    });
  });

  it("requires confirmation before bedtime removal also deletes wake", async () => {
    useSleepScheduleStore.setState({
      ...initialSleepScheduleData,
      actualRecords: [
        {
          id: "night-1",
          sleepDate: yesterday,
          bedAt: new Date(2026, 10, 25, 22).getTime(),
          wakeAt: new Date(2026, 10, 26, 7).getTime(),
        },
      ],
    });
    render(
      <SleepCalendarPanel
        selectedDate={yesterday}
        currentTime={currentTime}
        showAwakeTotals={false}
        awakeTotals={[]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear bedtime" }));
    expect(useSleepScheduleStore.getState().actualRecords).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Remove night" }));

    await waitFor(() => {
      expect(useSleepScheduleStore.getState().actualRecords).toEqual([]);
    });
  });
});
