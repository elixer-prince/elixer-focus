import { render, screen } from "@testing-library/react";
import RecentActivity from "@/features/profile/components/RecentActivity";
import { useSessionHistoryStore } from "@/features/countdown-timer/stores/session-history-store";
import { useTasksStore } from "@/features/tasks/stores/tasks-store";

describe("recent profile activity", () => {
  beforeEach(() => {
    const completedAt = 10_000_000;
    useSessionHistoryStore.setState({
      sessions: [
        {
          id: "focus-session",
          sessionType: "Focus",
          durationInSeconds: 600,
          completedAt,
        },
      ],
      trackedIntervals: [
        {
          id: "focus-overrun",
          kind: "overrun",
          startedAt: completedAt,
          endedAt: completedAt + 180_000,
          sessionId: "focus-session",
          userId: null,
          createdAt: completedAt,
          updatedAt: completedAt + 180_000,
        },
      ],
      lastCompletedSession: null,
      reflectionDraft: "",
    });
    useTasksStore.setState({ tasks: [] });
  });

  it("includes the session's overtime in its displayed duration", () => {
    render(<RecentActivity />);

    expect(screen.getByText("13 minutes")).toBeInTheDocument();
  });
});
