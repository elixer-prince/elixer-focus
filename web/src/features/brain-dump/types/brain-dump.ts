export type BrainDumpThought = {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  lastMutationId: string;
  userId: string | null;
};

export type BrainDumpCommand =
  | {
      type: "add";
      commandId: string;
      thoughtId: string;
      content: string;
      createdAt: number;
    }
  | {
      type: "update";
      commandId: string;
      thoughtId: string;
      content: string;
      updatedAt: number;
    }
  | {
      type: "delete";
      commandId: string;
      thoughtId: string;
    };

export type BrainDumpCommandOutcome =
  | "added"
  | "updated"
  | "deleted"
  | "already-applied"
  | "superseded"
  | "deleted-elsewhere";

export type BrainDumpCommandResult =
  | {
      success: true;
      outcome: BrainDumpCommandOutcome;
      thought?: BrainDumpThought;
    }
  | { success: false; error: string };

export type BrainDumpReadStatus = "loading" | "ready" | "error";
