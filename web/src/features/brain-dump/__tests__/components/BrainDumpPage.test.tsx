import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import BrainDumpPage from "@/features/brain-dump/components/BrainDumpPage";
import {
  setBrainDumpState,
  useBrainDumpStore,
} from "@/features/brain-dump/stores/brain-dump-store";
import type { BrainDumpThought } from "@/features/brain-dump/types/brain-dump";

const STORAGE_KEY = "brain-dump-storage";

const makeThought = (overrides: Partial<BrainDumpThought> = {}) =>
  ({
    id: "thought-1",
    content: "Call the dentist",
    createdAt: 100,
    updatedAt: 100,
    lastMutationId: "create-1",
    userId: null,
    ...overrides,
  }) as BrainDumpThought;

const seedThoughts = (thoughts: BrainDumpThought[]) => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ state: { thoughts }, version: 1 }),
  );
  setBrainDumpState({ thoughts, readStatus: "ready", readError: null });
};

let idCounter = 0;

beforeEach(() => {
  localStorage.clear();
  idCounter = 0;
  vi.stubGlobal("crypto", {
    randomUUID: () => `generated-${++idCounter}`,
  });
  setBrainDumpState({
    thoughts: [],
    readStatus: "ready",
    readError: null,
    crossTabSupported: false,
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("BrainDumpPage", () => {
  it("shows the capture flow and saves a trimmed thought", async () => {
    const requestOpen = vi.spyOn(XMLHttpRequest.prototype, "open");
    const requestSend = vi.spyOn(XMLHttpRequest.prototype, "send");
    render(<BrainDumpPage />);

    expect(
      screen.getByRole("heading", { name: "Brain dump", level: 1 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Capture what's on your mind. Sort it out later."),
    ).toBeInTheDocument();
    expect(screen.getByText("Nothing captured yet")).toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: "Search thoughts" }),
    ).toBeNull();

    const capture = screen.getByRole("textbox", {
      name: "What’s on your mind?",
    });
    fireEvent.change(capture, {
      target: { value: "  Call the dentist\nabout Tuesday  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(useBrainDumpStore.getState().thoughts).toMatchObject([
        {
          content: "Call the dentist\nabout Tuesday",
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
          userId: null,
        },
      ]);
    });
    expect(capture).toHaveValue("");
    expect(capture).toHaveFocus();
    expect(
      screen.getByRole("searchbox", { name: "Search thoughts" }),
    ).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).version).toBe(1);
    expect(requestOpen).not.toHaveBeenCalled();
    expect(requestSend).not.toHaveBeenCalled();
  });

  it("keeps a failed capture draft available", async () => {
    render(<BrainDumpPage />);
    const capture = screen.getByRole("textbox", {
      name: "What’s on your mind?",
    });
    fireEvent.change(capture, { target: { value: "Draft to keep" } });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded");
    });

    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => expect(capture).toHaveValue("Draft to keep"));
    expect(useBrainDumpStore.getState().thoughts).toEqual([]);
  });

  it("filters while typing and reapplies search after autosave ends", async () => {
    seedThoughts([makeThought({ content: "Remember to unwind" })]);
    vi.useFakeTimers();
    render(<BrainDumpPage />);

    const search = screen.getByRole("searchbox", { name: "Search thoughts" });
    fireEvent.change(search, { target: { value: "  unwind  " } });
    expect(screen.getByText("Remember to unwind")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const editor = screen.getByRole("textbox", { name: "Edit thought" });
    expect(editor).toHaveFocus();
    fireEvent.change(editor, { target: { value: "Book a flight" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(useBrainDumpStore.getState().thoughts[0].content).toBe(
      "Book a flight",
    );
    expect(screen.getByRole("textbox", { name: "Edit thought" })).toBeVisible();

    await act(async () => {
      fireEvent.blur(editor);
      await Promise.resolve();
    });
    expect(screen.getByText(/No thoughts match/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(search).toHaveFocus();
  });

  it("keeps blank edits open and ties validation to the editor", () => {
    const thought = makeThought();
    seedThoughts([thought]);
    render(<BrainDumpPage />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const editor = screen.getByRole("textbox", { name: "Edit thought" });
    fireEvent.change(editor, { target: { value: "   " } });
    fireEvent.blur(editor);

    expect(editor).toHaveAttribute("aria-invalid", "true");
    expect(editor).toHaveAccessibleDescription("A thought cannot be empty.");
    expect(useBrainDumpStore.getState().thoughts[0].content).toBe(
      thought.content,
    );
  });

  it("requires confirmation before permanently deleting a thought", async () => {
    seedThoughts([makeThought()]);
    render(<BrainDumpPage />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = screen.getByRole("dialog", { name: "Delete this thought?" });
    expect(within(dialog).getByText("Call the dentist")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(useBrainDumpStore.getState().thoughts).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const reopenedDialog = screen.getByRole("dialog", {
      name: "Delete this thought?",
    });
    fireEvent.click(
      within(reopenedDialog).getByRole("button", { name: "Delete" }),
    );

    await waitFor(() =>
      expect(useBrainDumpStore.getState().thoughts).toEqual([]),
    );
    expect(screen.getByText("Nothing captured yet")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("textbox", { name: "What’s on your mind?" }),
      ).toHaveFocus(),
    );
  });

  it("keeps a thought and its confirmation open when deletion cannot be saved", async () => {
    seedThoughts([makeThought()]);
    render(<BrainDumpPage />);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    const dialog = screen.getByRole("dialog", { name: "Delete this thought?" });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded");
    });

    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(useBrainDumpStore.getState().thoughts).toHaveLength(1),
    );
    expect(
      screen.getByRole("dialog", { name: "Delete this thought?" }),
    ).toBeVisible();
  });

  it("preserves a draft after another tab deletes its thought", async () => {
    seedThoughts([makeThought()]);
    render(<BrainDumpPage />);

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    const editor = screen.getByRole("textbox", { name: "Edit thought" });
    fireEvent.change(editor, {
      target: { value: "Keep this as a new thought" },
    });

    act(() => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ state: { thoughts: [] }, version: 1 }),
      );
      setBrainDumpState({ thoughts: [] });
    });

    expect(screen.getByText(/removed in another tab/)).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Draft thought" }), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save as new" }));
    expect(
      screen.getByRole("textbox", { name: "Draft thought" }),
    ).toHaveAttribute("aria-invalid", "true");
    fireEvent.change(screen.getByRole("textbox", { name: "Draft thought" }), {
      target: { value: "Keep this as a new thought" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save as new" }));

    await waitFor(() => {
      expect(useBrainDumpStore.getState().thoughts).toMatchObject([
        { content: "Keep this as a new thought" },
      ]);
    });
    expect(screen.queryByText(/removed in another tab/)).toBeNull();
    await waitFor(() =>
      expect(
        screen.getByRole("textbox", { name: "What’s on your mind?" }),
      ).toHaveFocus(),
    );
  });

  it("shows a read error instead of an empty inbox and retries", async () => {
    const thought = makeThought();
    seedThoughts([thought]);
    setBrainDumpState({
      readStatus: "error",
      readError: "Your saved thoughts could not be read.",
    });
    render(<BrainDumpPage />);

    expect(
      screen.getByRole("heading", {
        name: "Your saved thoughts could not be loaded",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Nothing captured yet")).toBeNull();
    expect(screen.getByRole("button", { name: "Add" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() =>
      expect(useBrainDumpStore.getState().readStatus).toBe("ready"),
    );
    expect(screen.getByText("Call the dentist")).toBeInTheDocument();
  });
});
