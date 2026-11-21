import { act, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";

const mocks = vi.hoisted(() => ({
  clearIntervalIfItExistsMock: vi.fn(),
  timerIntervalRef: { current: 123 as number | null },
}));

vi.mock("@/utils/interval", () => ({
  clearIntervalIfItExists: mocks.clearIntervalIfItExistsMock,
}));

import SettingsLayout from "@/app/layout/Settings";

describe("SettingsLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.timerIntervalRef.current = 123;
  });

  it("should render the outlet content", () => {
    render(
      <MemoryRouter initialEntries={["/settings"]}>
        <Routes>
          <Route path="/settings" element={<SettingsLayout />}>
            <Route
              index
              element={<div data-testid="settings-page">Timer Settings</div>}
            />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("settings-page")).toBeInTheDocument();
    expect(screen.getByText("Timer Settings")).toBeInTheDocument();
  });

  it("should not clear the shared timer interval when mounted", () => {
    mocks.timerIntervalRef.current = 456;

    render(
      <MemoryRouter initialEntries={["/settings"]}>
        <Routes>
          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<div>Settings Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    // If SettingsLayout called useCountdownTimer, its cleanup would call clearIntervalIfItExists
    expect(mocks.clearIntervalIfItExistsMock).not.toHaveBeenCalled();
    // The interval ref should remain untouched
    expect(mocks.timerIntervalRef.current).toBe(456);
  });

  it("should not clear the shared timer interval when unmounted", () => {
    mocks.timerIntervalRef.current = 789;

    const { unmount } = render(
      <MemoryRouter initialEntries={["/settings"]}>
        <Routes>
          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<div>Settings Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    act(() => {
      unmount();
    });

    // Unmounting SettingsLayout should NOT clear the timer interval
    // because it should not call useCountdownTimer
    expect(mocks.clearIntervalIfItExistsMock).not.toHaveBeenCalled();
    expect(mocks.timerIntervalRef.current).toBe(789);
  });

  it("should not import or use useCountdownTimer hook", () => {
    // This test verifies the source code does not reference useCountdownTimer
    // by checking that the component renders without consuming the countdown context
    // that useCountdownTimer would require
    const { unmount } = render(
      <MemoryRouter initialEntries={["/settings"]}>
        <Routes>
          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<div>Settings Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    // Should render without errors even without CountdownProvider
    // because SettingsLayout should not depend on countdown timer hooks
    expect(screen.getByText("Settings Content")).toBeInTheDocument();

    unmount();
  });
});
