import { afterEach, describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";

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
});
