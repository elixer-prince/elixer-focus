import {
  applyBrainDumpCommand,
  dispatchBrainDumpCommand,
  readBrainDumpThoughts,
  retryReadBrainDumpThoughts,
  startBrainDumpCoordinator,
} from "@/features/brain-dump/services/brain-dump-coordinator";
import {
  setBrainDumpState,
  useBrainDumpStore,
} from "@/features/brain-dump/stores/brain-dump-store";
import type {
  BrainDumpCommand,
  BrainDumpThought,
} from "@/features/brain-dump/types/brain-dump";

const STORAGE_KEY = "brain-dump-storage";

const makeThought = (
  overrides: Partial<BrainDumpThought> = {},
): BrainDumpThought =>
  ({
    id: "thought-1",
    content: "First thought",
    createdAt: 100,
    updatedAt: 100,
    lastMutationId: "create-1",
    userId: null,
    ...overrides,
  }) as BrainDumpThought;

const channels: FakeBroadcastChannel[] = [];

class FakeBroadcastChannel {
  name: string;
  onmessage: ((event: MessageEvent<unknown>) => void) | null = null;
  messages: unknown[] = [];
  storageAtStateBroadcast: (string | null)[] = [];
  closed = false;

  constructor(name: string) {
    this.name = name;
    channels.push(this);
  }

  postMessage(message: unknown) {
    this.messages.push(message);
    if ((message as { type?: string }).type === "state") {
      this.storageAtStateBroadcast.push(localStorage.getItem(STORAGE_KEY));
    }
  }

  close() {
    this.closed = true;
  }
}

let stopCoordinator: (() => void) | undefined;

beforeEach(() => {
  localStorage.clear();
  channels.length = 0;
  setBrainDumpState({
    thoughts: [],
    readStatus: "loading",
    readError: null,
    crossTabSupported: false,
  });
  vi.stubGlobal("BroadcastChannel", undefined);
  Object.defineProperty(navigator, "locks", {
    configurable: true,
    value: undefined,
  });
});

afterEach(() => {
  stopCoordinator?.();
  stopCoordinator = undefined;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Object.defineProperty(navigator, "locks", {
    configurable: true,
    value: undefined,
  });
});

describe("brain dump command rules", () => {
  it("trims new thought edges and keeps the newest thought first", () => {
    const result = applyBrainDumpCommand([makeThought()], {
      type: "add",
      commandId: "create-2",
      thoughtId: "thought-2",
      content: "  Second\nthought  ",
      createdAt: 200,
    });

    expect(result.result).toMatchObject({ success: true, outcome: "added" });
    expect(result.thoughts.map(({ id }) => id)).toEqual([
      "thought-2",
      "thought-1",
    ]);
    expect(result.thoughts[0]).toMatchObject({
      content: "Second\nthought",
      createdAt: 200,
      updatedAt: 200,
      lastMutationId: "create-2",
      userId: null,
    });
  });

  it("puts a newly added thought first when timestamps are equal", () => {
    const result = applyBrainDumpCommand([makeThought()], {
      type: "add",
      commandId: "create-2",
      thoughtId: "thought-2",
      content: "Second thought",
      createdAt: 100,
    });

    expect(result.thoughts.map(({ id }) => id)).toEqual([
      "thought-2",
      "thought-1",
    ]);
  });

  it("makes add retries idempotent and rejects blank content", () => {
    const command: BrainDumpCommand = {
      type: "add",
      commandId: "create-1",
      thoughtId: "thought-1",
      content: "Different retry text",
      createdAt: 200,
    };

    expect(
      applyBrainDumpCommand([makeThought()], command).result,
    ).toMatchObject({ success: true, outcome: "already-applied" });
    expect(
      applyBrainDumpCommand([], { ...command, content: " \n " }).result,
    ).toEqual({ success: false, error: "Thought cannot be empty." });
  });

  it("keeps creation order and resolves equal time edits by command ID", () => {
    const thought = makeThought();
    const update: BrainDumpCommand = {
      type: "update",
      commandId: "mutation-z",
      thoughtId: thought.id,
      content: "Newest text",
      updatedAt: 200,
    };
    const accepted = applyBrainDumpCommand([thought], update);
    const superseded = applyBrainDumpCommand(accepted.thoughts, {
      ...update,
      commandId: "mutation-a",
      content: "Older text",
    });

    expect(accepted.thoughts[0]).toMatchObject({
      content: "Newest text",
      createdAt: thought.createdAt,
      updatedAt: 200,
      lastMutationId: "mutation-z",
    });
    expect(superseded.result).toMatchObject({
      success: true,
      outcome: "superseded",
      thought: { content: "Newest text" },
    });
    expect(superseded.changed).toBe(false);
  });

  it("does not recreate a thought deleted in another tab", () => {
    const result = applyBrainDumpCommand([], {
      type: "update",
      commandId: "edit-after-delete",
      thoughtId: "thought-1",
      content: "Draft text",
      updatedAt: 200,
    });

    expect(result.result).toEqual({
      success: true,
      outcome: "deleted-elsewhere",
    });
    expect(result.thoughts).toEqual([]);
  });
});

describe("brain dump coordinator", () => {
  it("keeps a malformed stored value untouched and blocks writes until retry", async () => {
    localStorage.setItem(STORAGE_KEY, "not-json");
    stopCoordinator = startBrainDumpCoordinator();

    expect(useBrainDumpStore.getState()).toMatchObject({
      thoughts: [],
      readStatus: "error",
    });

    const result = await dispatchBrainDumpCommand({
      type: "add",
      commandId: "create-1",
      thoughtId: "thought-1",
      content: "Keep this draft",
      createdAt: 100,
    });
    const retry = await retryReadBrainDumpThoughts();

    expect(result.success).toBe(false);
    expect(retry.success).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBe("not-json");
    expect(useBrainDumpStore.getState().readStatus).toBe("error");
  });

  it("shows a read error when local storage access throws, then retries", async () => {
    const getItem = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("Storage is blocked");
      });
    stopCoordinator = startBrainDumpCoordinator();

    expect(useBrainDumpStore.getState().readStatus).toBe("error");
    expect(
      await dispatchBrainDumpCommand({
        type: "add",
        commandId: "create-1",
        thoughtId: "thought-1",
        content: "Draft stays here",
        createdAt: 100,
      }),
    ).toMatchObject({ success: false });

    getItem.mockRestore();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { thoughts: [makeThought()] }, version: 1 }),
    );
    expect((await retryReadBrainDumpThoughts()).success).toBe(true);
    expect(useBrainDumpStore.getState()).toMatchObject({
      readStatus: "ready",
      thoughts: [{ id: "thought-1" }],
    });
  });

  it("preserves thoughts when local storage writes fail", async () => {
    stopCoordinator = startBrainDumpCoordinator();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded");
    });

    const result = await dispatchBrainDumpCommand({
      type: "add",
      commandId: "create-1",
      thoughtId: "thought-1",
      content: "Unsaved draft",
      createdAt: 100,
    });

    expect(result).toEqual({ success: false, error: "Quota exceeded" });
    expect(useBrainDumpStore.getState()).toMatchObject({
      thoughts: [],
      readStatus: "ready",
    });
  });

  it("serializes writes and broadcasts only after persistence", async () => {
    vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: {
        request: async (_name: string, callback: () => unknown) => callback(),
      },
    });
    stopCoordinator = startBrainDumpCoordinator();

    const result = await dispatchBrainDumpCommand({
      type: "add",
      commandId: "create-1",
      thoughtId: "thought-1",
      content: "Saved thought",
      createdAt: 100,
    });
    const channel = channels[0];

    expect(result).toMatchObject({ success: true, outcome: "added" });
    expect(
      JSON.parse(localStorage.getItem(STORAGE_KEY)!).state.thoughts,
    ).toHaveLength(1);
    expect(
      channel.messages.map((message) => (message as { type: string }).type),
    ).toEqual(["command", "state"]);
    expect(channel.storageAtStateBroadcast).toEqual([expect.any(String)]);
    expect(useBrainDumpStore.getState().crossTabSupported).toBe(true);
  });

  it("replays peer commands safely and refreshes from the latest stored state", async () => {
    vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: {
        request: async (_name: string, callback: () => unknown) => callback(),
      },
    });
    stopCoordinator = startBrainDumpCoordinator();
    const channel = channels[0];
    const addCommand: BrainDumpCommand = {
      type: "add",
      commandId: "create-1",
      thoughtId: "thought-1",
      content: "Shared thought",
      createdAt: 100,
    };

    await dispatchBrainDumpCommand(addCommand);
    channel.onmessage?.({
      data: { type: "command", command: addCommand },
    } as MessageEvent<unknown>);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(useBrainDumpStore.getState().thoughts).toMatchObject([
      { id: "thought-1", content: "Shared thought" },
    ]);

    const latestThought = makeThought({ content: "Changed in another tab" });
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { thoughts: [latestThought] }, version: 1 }),
    );
    channel.onmessage?.({ data: { type: "state" } } as MessageEvent<unknown>);

    expect(useBrainDumpStore.getState().thoughts[0].content).toBe(
      "Changed in another tab",
    );
  });

  it.each(["Web Locks", "BroadcastChannel"] as const)(
    "allows one tab fallback when %s is missing",
    async (missingApi) => {
      if (missingApi === "Web Locks") {
        vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
      }
      Object.defineProperty(navigator, "locks", {
        configurable: true,
        value:
          missingApi === "Web Locks"
            ? undefined
            : {
                request: async (_name: string, callback: () => unknown) =>
                  callback(),
              },
      });
      stopCoordinator = startBrainDumpCoordinator();

      const result = await dispatchBrainDumpCommand({
        type: "add",
        commandId: "create-1",
        thoughtId: "thought-1",
        content: "Single tab thought",
        createdAt: 100,
      });

      expect(result.success).toBe(true);
      expect(useBrainDumpStore.getState()).toMatchObject({
        crossTabSupported: false,
        thoughts: [{ content: "Single tab thought" }],
      });
      stopCoordinator?.();
      stopCoordinator = undefined;
    },
  );

  it("loads valid stored thoughts and permits retry after a read error", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { thoughts: [makeThought()] }, version: 1 }),
    );
    expect(readBrainDumpThoughts()).toEqual({ success: true });
    expect(useBrainDumpStore.getState()).toMatchObject({
      readStatus: "ready",
      thoughts: [{ id: "thought-1" }],
    });
    expect((await retryReadBrainDumpThoughts()).success).toBe(true);
  });
});
