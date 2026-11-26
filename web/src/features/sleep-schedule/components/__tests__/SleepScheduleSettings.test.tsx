import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SleepScheduleSettings from "@/features/sleep-schedule/components/SleepScheduleSettings";
import {
  initialSleepScheduleData,
  type SleepScheduleSettings as SleepSettings,
} from "@/features/sleep-schedule/types/sleep-schedule";
import { useSleepScheduleStore } from "@/stores";

const schedule: SleepSettings = {
  wakeTime: "07:00",
  targetSleepDurationMinutes: 480,
  bedTimeOverride: null,
};

beforeEach(() => {
  localStorage.clear();
  useSleepScheduleStore.setState(initialSleepScheduleData);
});

describe("Sleep Schedule settings", () => {
  it("shows the configured planned bedtime and target duration", () => {
    useSleepScheduleStore.setState({
      ...initialSleepScheduleData,
      settings: schedule,
    });
    render(<SleepScheduleSettings />);

    expect(screen.getByText(/Planned bedtime/)).toBeInTheDocument();
    expect(screen.getByText(/Planned sleep: 8 hr/)).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: /Target sleep duration/ }),
    ).toHaveValue(8);
    expect(screen.getByRole("button", { name: "Save schedule" })).toBeEnabled();
  });

  it("updates the planned bedtime preview as the wake time draft changes", () => {
    useSleepScheduleStore.setState({
      ...initialSleepScheduleData,
      settings: schedule,
    });
    render(<SleepScheduleSettings />);

    const plannedBedtime = screen.getByText(/Planned bedtime/);
    const originalPreview = plannedBedtime.textContent;
    const bedtimeOverride = screen.getByLabelText("Bedtime override");
    const previewCard = plannedBedtime.closest(".bg-base-100");
    expect(
      previewCard!.compareDocumentPosition(bedtimeOverride) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Usual wake time"), {
      target: { value: "06:00" },
    });

    expect(screen.getByText(/Planned bedtime/).textContent).not.toBe(
      originalPreview,
    );
    expect(useSleepScheduleStore.getState().settings).toEqual(schedule);
  });

  it("explains when a manual bedtime changes the planned duration", () => {
    useSleepScheduleStore.setState({
      ...initialSleepScheduleData,
      settings: { ...schedule, bedTimeOverride: "20:00" },
    });
    render(<SleepScheduleSettings />);

    expect(
      screen.getByText(/3 hr longer than your target/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reset to automatic bedtime" }),
    ).toBeEnabled();
  });

  it("confirms schedule clearing and keeps actual records", async () => {
    const actualRecords = [
      {
        id: "actual-night",
        sleepDate: "2026-11-25",
        bedAt: new Date(2026, 10, 25, 22).getTime(),
        wakeAt: null,
      },
    ];
    useSleepScheduleStore.setState({
      ...initialSleepScheduleData,
      settings: schedule,
      actualRecords,
    });
    render(<SleepScheduleSettings />);

    fireEvent.click(screen.getByRole("button", { name: "Clear schedule" }));
    expect(
      screen.getByRole("group", {
        name: "Confirm clearing the sleep schedule",
      }),
    ).toBeInTheDocument();
    expect(useSleepScheduleStore.getState().settings).toEqual(schedule);

    fireEvent.click(screen.getByRole("button", { name: "Clear schedule" }));
    await waitFor(() => {
      expect(useSleepScheduleStore.getState().settings).toEqual({
        ...schedule,
        wakeTime: null,
      });
    });
    expect(useSleepScheduleStore.getState().actualRecords).toEqual(
      actualRecords,
    );
  });

  it("saves edited settings through the feature coordinator", async () => {
    render(<SleepScheduleSettings />);

    fireEvent.change(screen.getByLabelText("Usual wake time"), {
      target: { value: "06:30" },
    });
    fireEvent.change(
      screen.getByRole("spinbutton", { name: /Target sleep duration/ }),
      {
        target: { value: "7.5" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Save schedule" }));

    await waitFor(() => {
      expect(useSleepScheduleStore.getState().settings).toEqual({
        wakeTime: "06:30",
        targetSleepDurationMinutes: 450,
        bedTimeOverride: null,
      });
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Sleep schedule saved.",
    );
  });

  it("keeps invalid persisted values and actual records visible for repair", () => {
    const invalidSettings = {
      wakeTime: "25:30",
      targetSleepDurationMinutes: 485,
      bedTimeOverride: null,
    } as unknown as SleepSettings;
    const actualRecords = [
      {
        id: "actual-night",
        sleepDate: "2026-11-25",
        bedAt: new Date(2026, 10, 25, 22).getTime(),
        wakeAt: null,
      },
    ];
    useSleepScheduleStore.setState({
      ...initialSleepScheduleData,
      settings: invalidSettings,
      actualRecords,
    });
    render(<SleepScheduleSettings />);

    expect(screen.getByRole("alert")).toHaveTextContent("needs repair");
    expect(screen.queryByText(/Planned bedtime/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: /Target sleep duration/ }),
    ).toHaveValue(485 / 60);
    expect(useSleepScheduleStore.getState().settings).toEqual(invalidSettings);
    expect(useSleepScheduleStore.getState().actualRecords).toEqual(
      actualRecords,
    );
  });

  it("requires confirmation before deleting migration recovery data", async () => {
    useSleepScheduleStore.setState({
      ...initialSleepScheduleData,
      recoveryEntries: [
        {
          id: "legacy-bad",
          legacyEvent: { id: "old" },
          reason: "invalidEvent",
        },
      ],
    });
    render(<SleepScheduleSettings />);

    fireEvent.click(
      screen.getByRole("button", { name: /Legacy record recovery/ }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Delete recovery archive" }),
    );
    expect(useSleepScheduleStore.getState().recoveryEntries).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Delete archive" }));
    await waitFor(() => {
      expect(useSleepScheduleStore.getState().recoveryEntries).toEqual([]);
    });
  });
});
