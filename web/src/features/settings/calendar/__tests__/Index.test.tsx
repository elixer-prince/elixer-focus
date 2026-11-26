import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import SettingsLayout from "@/app/layout/Settings";
import CalendarSettings from "@/features/settings/calendar/Index";
import { initialCalendarData } from "@/features/calendar/types/calendar";
import { useCalendarStore, useTasksStore } from "@/stores";
import { startCalendarCoordinator } from "@/features/calendar/services/calendar-coordinator";

vi.mock(
  "@/features/calendar/services/calendar-coordinator",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("@/features/calendar/services/calendar-coordinator")
      >();
    return {
      ...actual,
      startCalendarCoordinator: vi.fn(() => vi.fn()),
    };
  },
);

vi.mock("@/features/countdown-timer/components/TimerModal", () => ({
  default: () => null,
}));

vi.mock("@/features/journal/components/SessionReflection/Modal", () => ({
  default: () => null,
}));

beforeEach(() => {
  localStorage.clear();
  act(() => {
    useTasksStore.setState({ tasks: [] });
    useCalendarStore.setState({ ...initialCalendarData });
  });
});

describe("Calendar settings", () => {
  it("saves the selected week start preference through the calendar store", async () => {
    render(<CalendarSettings />);

    const weekStartSelect = screen.getByRole("combobox", {
      name: "Week starts on",
    });
    expect(weekStartSelect).toHaveValue("0");

    fireEvent.change(weekStartSelect, { target: { value: "3" } });

    await waitFor(() => {
      expect(useCalendarStore.getState().weekStartsOn).toBe(3);
    });
    const storedCalendar = JSON.parse(
      localStorage.getItem("calendar-storage") ?? "null",
    ) as { state: { weekStartsOn: number } };
    expect(storedCalendar.state.weekStartsOn).toBe(3);
  });

  it("offers all seven weekdays as the start of the week", () => {
    render(<CalendarSettings />);

    expect(screen.getAllByRole("option")).toHaveLength(7);
    expect(screen.getByRole("option", { name: "Sunday" })).toHaveValue("0");
    expect(screen.getByRole("option", { name: "Saturday" })).toHaveValue("6");
  });

  it("starts Calendar coordination in the Settings layout", () => {
    vi.mocked(startCalendarCoordinator).mockClear();
    render(
      <MemoryRouter initialEntries={["/calendar"]}>
        <Routes>
          <Route path="/calendar" element={<SettingsLayout />}>
            <Route index element={<CalendarSettings />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(startCalendarCoordinator).toHaveBeenCalledOnce();
  });
});
