import { render, screen } from "@testing-library/react";
import CountdownProvider from "@/app/providers/Countdown";
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
      <CountdownProvider>
        <MemoryRouter initialEntries={["/settings"]}>
          <Routes>
            <Route path="/settings" element={<SettingsLayout />}>
              <Route
                index
                element={<div data-testid="settings-page">Timer Settings</div>}
              />
            </Route>
          </Routes>
        </MemoryRouter>
      </CountdownProvider>,
    );

    expect(screen.getByTestId("settings-page")).toBeInTheDocument();
    expect(screen.getByText("Timer Settings")).toBeInTheDocument();
  });

  it("should render the Modal component for timer end notifications", () => {
    render(
      <CountdownProvider>
        <MemoryRouter initialEntries={["/settings"]}>
          <Routes>
            <Route path="/settings" element={<SettingsLayout />}>
              <Route index element={<div>Settings Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </CountdownProvider>,
    );

    // The Modal dialog should be present in the DOM
    expect(document.querySelector("dialog.modal")).toBeInTheDocument();
  });

  it("should render the outlet content alongside the Modal", () => {
    render(
      <CountdownProvider>
        <MemoryRouter initialEntries={["/settings"]}>
          <Routes>
            <Route path="/settings" element={<SettingsLayout />}>
              <Route index element={<div>Settings Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </CountdownProvider>,
    );

    expect(screen.getByText("Settings Content")).toBeInTheDocument();
    expect(document.querySelector("dialog.modal")).toBeInTheDocument();
  });

  it("should render the Sidebar component", () => {
    render(
      <CountdownProvider>
        <MemoryRouter initialEntries={["/settings"]}>
          <Routes>
            <Route path="/settings" element={<SettingsLayout />}>
              <Route index element={<div>Settings Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </CountdownProvider>,
    );

    // Sidebar should be present (it renders a nav element)
    expect(document.querySelector("nav")).toBeInTheDocument();
  });
});
