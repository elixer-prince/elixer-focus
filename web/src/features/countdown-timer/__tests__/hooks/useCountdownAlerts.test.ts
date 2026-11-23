import { act, renderHook } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  showModal: vi.fn(),
  sendTimerEndNotification: vi.fn(),
  mockDialog: { showModal: vi.fn() } as HTMLDialogElement,
  modalRef: { current: null as HTMLDialogElement | null },
}));

vi.mock("@/features/countdown-timer/hooks/useCountdownContext", () => ({
  default: () => ({
    modalRef: mocks.modalRef,
  }),
}));

vi.mock("@/features/countdown-timer/hooks/useNotification", () => ({
  default: () => ({
    sendTimerEndNotification: mocks.sendTimerEndNotification,
  }),
}));

import useCountdownAlerts from "@/features/countdown-timer/hooks/useCountdownAlerts";

describe("useCountdownAlerts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.mockDialog.showModal = vi.fn();
    mocks.modalRef.current = mocks.mockDialog;
  });

  describe("alertUserOfTimerEnd", () => {
    it("should show the modal dialog", () => {
      const { result } = renderHook(() => useCountdownAlerts());

      act(() => {
        result.current.alertUserOfTimerEnd("Focus");
      });

      expect(mocks.mockDialog.showModal).toHaveBeenCalled();
    });

    it("should send a desktop notification with session type", () => {
      const { result } = renderHook(() => useCountdownAlerts());

      act(() => {
        result.current.alertUserOfTimerEnd("Focus");
      });

      expect(mocks.sendTimerEndNotification).toHaveBeenCalledWith("Focus");
    });

    it("should show modal and send notification together", () => {
      const { result } = renderHook(() => useCountdownAlerts());

      act(() => {
        result.current.alertUserOfTimerEnd("Short Break");
      });

      expect(mocks.mockDialog.showModal).toHaveBeenCalledTimes(1);
      expect(mocks.sendTimerEndNotification).toHaveBeenCalledWith(
        "Short Break",
      );
    });

    it("should handle modal ref being null gracefully", () => {
      mocks.modalRef.current = null;

      const { result } = renderHook(() => useCountdownAlerts());

      act(() => {
        result.current.alertUserOfTimerEnd("Focus");
      });

      expect(mocks.sendTimerEndNotification).toHaveBeenCalled();
    });
  });
});
