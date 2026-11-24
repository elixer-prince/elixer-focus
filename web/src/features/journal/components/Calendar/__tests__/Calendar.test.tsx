import { afterEach, describe, expect, it, vi } from "vitest";

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { subMonths } from "date-fns";

import JournalCalendar from "@/features/journal/components/Calendar/Index";

const mockEntries = [];
const mockNotes = [];

vi.mock("@/features/journal/stores/journal-store", () => {
  return {
    useEntries: () => mockEntries,
    useNotes: () => mockNotes,
    useJournalStore: {
      getState: () => ({ entries: mockEntries, notes: mockNotes }),
      setState: vi.fn(),
    },
  };
});

afterEach(() => {
  vi.clearAllMocks();
  mockEntries.length = 0;
  mockNotes.length = 0;
});

describe("Journal Calendar", () => {
  const onSelectDate = vi.fn();

  it("renders the current month name", () => {
    render(
      <JournalCalendar onSelectDate={onSelectDate} selectedDate={undefined} />,
    );

    const now = new Date();
    const monthName = now.toLocaleString("en", { month: "long" });
    expect(screen.getByText(new RegExp(monthName, "i"))).toBeInTheDocument();
  });

  it("renders navigation buttons", () => {
    render(
      <JournalCalendar onSelectDate={onSelectDate} selectedDate={undefined} />,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("renders day cells in the calendar grid", () => {
    render(
      <JournalCalendar onSelectDate={onSelectDate} selectedDate={undefined} />,
    );

    const gridCells = screen.getAllByRole("gridcell");
    expect(gridCells.length).toBeGreaterThan(0);
  });

  it("marks days with entries", () => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    mockEntries.push({
      id: "1",
      date: todayStr,
      userId: null,
      content: "test",
      createdAt: 1000,
      updatedAt: 1000,
    });

    render(
      <JournalCalendar onSelectDate={onSelectDate} selectedDate={today} />,
    );

    const dayWithEntry = document.querySelector(".day-with-entry");
    expect(dayWithEntry).toBeInTheDocument();
  });

  it("hides Today button when viewing current month", () => {
    render(
      <JournalCalendar onSelectDate={onSelectDate} selectedDate={new Date()} />,
    );

    expect(screen.queryByText("Today")).not.toBeInTheDocument();
  });

  it("selects today's date when Today button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <JournalCalendar onSelectDate={onSelectDate} selectedDate={undefined} />,
    );

    const now = new Date();

    const previousButton = screen.getAllByRole("button")[0];
    await user.click(previousButton);

    const previousMonth = subMonths(now, 1);
    const previousMonthName = previousMonth.toLocaleString("en", {
      month: "long",
    });
    await waitFor(() => {
      expect(
        screen.getByText(new RegExp(previousMonthName, "i")),
      ).toBeInTheDocument();
    });

    const todayButton = await screen.findByText("Today");
    await user.click(todayButton);

    expect(onSelectDate).toHaveBeenCalledWith(expect.any(Date));
    const calledDate = onSelectDate.mock.calls[0][0];
    expect(calledDate.getDate()).toBe(now.getDate());
    expect(calledDate.getMonth()).toBe(now.getMonth());
    expect(calledDate.getFullYear()).toBe(now.getFullYear());
  });
});
