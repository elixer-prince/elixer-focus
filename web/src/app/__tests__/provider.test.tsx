import { render } from "@testing-library/react";
import type { PropsWithChildren } from "react";

const mocks = vi.hoisted(() => ({
  appReadyDuringTimerRestore: null as boolean | null,
}));

vi.mock("@/app/providers/Countdown", () => ({
  default: ({ children }: PropsWithChildren) => children,
}));

vi.mock("@/app/providers/Music", () => ({
  default: ({ children }: PropsWithChildren) => children,
}));

vi.mock("@/features/countdown-timer/hooks/useCountdownTimer", async () => {
  const { useLayoutEffect } = await import("react");

  const MockCountdownTimer = () => {
    useLayoutEffect(() => {
      mocks.appReadyDuringTimerRestore =
        document.body.classList.contains("app-ready");
    }, []);
  };

  return {
    default: MockCountdownTimer,
  };
});

vi.mock("@/features/countdown-timer/hooks/useAutoSyncTimer", () => ({
  default: vi.fn(),
}));

vi.mock("@/hooks/useDate", () => ({
  useDate: vi.fn(),
}));

vi.mock("@/features/music-player/components/Index", () => ({
  default: () => null,
}));

import Provider from "@/app/provider";

describe("Provider startup visibility", () => {
  beforeEach(() => {
    document.body.classList.remove("app-ready");
    mocks.appReadyDuringTimerRestore = null;
  });

  afterEach(() => {
    document.body.classList.remove("app-ready");
  });

  it("reveals the app only after timer restoration begins", () => {
    render(
      <Provider>
        <div>App content</div>
      </Provider>,
    );

    expect(mocks.appReadyDuringTimerRestore).toBe(false);
    expect(document.body).toHaveClass("app-ready");
  });
});
