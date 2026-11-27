import { fireEvent, render, screen, within } from "@testing-library/react";
import ProfileRoute from "@/app/routes/my/Profile";

const profileMocks = vi.hoisted(() => ({
  displayName: "Focus User",
  bio: "",
  sessions: [] as unknown[],
  tasks: [] as unknown[],
  currentTheme: "dark",
  updateProfile: vi.fn(),
}));

vi.mock("@/stores", () => ({
  useProfileDisplayName: () => profileMocks.displayName,
  useProfileBio: () => profileMocks.bio,
  useUpdateProfile: () => profileMocks.updateProfile,
  useSessions: () => profileMocks.sessions,
  useTasks: () => profileMocks.tasks,
  useCurrentTheme: () => profileMocks.currentTheme,
}));

vi.mock("@/features/countdown-timer/stores/countdown-store", () => ({
  useTimerRunning: () => false,
}));

vi.mock("@/hooks/usePageTitle", () => ({
  default: () => ({ updatePageTitle: vi.fn() }),
}));

describe("Profile route", () => {
  beforeEach(() => {
    profileMocks.displayName = "Focus User";
    profileMocks.bio = "";
    profileMocks.sessions = [];
    profileMocks.tasks = [];
    profileMocks.currentTheme = "dark";
    profileMocks.updateProfile.mockClear();
  });

  it("AC-1, AC-2, AC-4, AC-5, AC-9: renders profile sections with empty states", () => {
    render(<ProfileRoute />);

    expect(
      screen.getByRole("heading", { name: "Profile" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Focus User" }),
    ).toBeInTheDocument();
    expect(screen.getByText("0.0")).toBeInTheDocument();
    expect(screen.getByText("No activity yet")).toBeInTheDocument();
    expect(screen.getAllByText("Locked")).toHaveLength(2);
    expect(screen.getByText("Dark")).toBeInTheDocument();
  });

  it("AC-2, AC-3, AC-4, AC-5, AC-8: shows store data and fixed character stats", () => {
    const { rerender } = render(<ProfileRoute />);
    const placeholders = ["Focus", "Discipline", "Creativity"].map((name) =>
      screen.getByRole("progressbar", {
        name: `${name} placeholder value`,
      }),
    );

    expect(placeholders.map((bar) => bar.getAttribute("value"))).toEqual([
      "78",
      "64",
      "52",
    ]);

    profileMocks.sessions = [
      {
        id: "focus-session",
        sessionType: "Focus",
        durationInSeconds: 7200,
        completedAt: new Date(2026, 0, 1, 10).getTime(),
      },
    ];
    profileMocks.tasks = [
      {
        id: "completed-task",
        title: "Plan the week",
        isCompleted: true,
        completedAt: new Date(2026, 0, 1, 11).getTime(),
      },
    ];

    rerender(<ProfileRoute />);

    expect(screen.getByText("2.0")).toBeInTheDocument();
    const stats = screen.getByRole("region", { name: "Productivity stats" });
    expect(
      within(stats).getByText("Tasks completed").parentElement,
    ).toHaveTextContent("1");
    expect(
      within(stats).getByText("Current streak").parentElement,
    ).toHaveTextContent("1");
    expect(screen.getByText("Plan the week")).toBeInTheDocument();
    expect(screen.getByText("Focus session")).toBeInTheDocument();
    const activity = screen.getByRole("list", { name: "Recent activity" });
    expect(within(activity).getByText("120 minutes")).toBeInTheDocument();
    expect(
      within(activity)
        .getByText("Focus session")
        .closest("li")
        ?.querySelector("time"),
    ).toHaveAttribute("datetime", new Date(2026, 0, 1, 10).toISOString());
    expect(screen.getAllByText("Unlocked")).toHaveLength(2);
    expect(placeholders.map((bar) => bar.getAttribute("value"))).toEqual([
      "78",
      "64",
      "52",
    ]);
  });

  it("AC-9: reflects theme changes made in Settings", () => {
    const { rerender } = render(<ProfileRoute />);

    expect(screen.getByText("Dark")).toBeInTheDocument();
    profileMocks.currentTheme = "light";
    rerender(<ProfileRoute />);

    expect(screen.getByText("Light")).toBeInTheDocument();
  });

  it("AC-6, AC-9: saves the name and bio without making the theme editable", () => {
    render(<ProfileRoute />);

    fireEvent.click(screen.getByRole("button", { name: "Edit profile" }));
    fireEvent.change(screen.getByLabelText("Display name"), {
      target: { value: "Alex" },
    });
    fireEvent.change(screen.getByLabelText("Bio"), {
      target: { value: "Building better focus habits." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(profileMocks.updateProfile).toHaveBeenCalledWith(
      "Alex",
      "Building better focus habits.",
    );
    expect(
      screen.getByText("Your profile has been updated."),
    ).toBeInTheDocument();
    expect(screen.getByText("Dark")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Dark" }),
    ).not.toBeInTheDocument();
  });
});
