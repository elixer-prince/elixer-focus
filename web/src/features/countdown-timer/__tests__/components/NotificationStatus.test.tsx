import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, vi } from "vitest";

const mockUseTimerRunning = vi.fn();
vi.mock("@/features/countdown-timer/stores/countdown-store", () => ({
  useTimerRunning: () => mockUseTimerRunning(),
}));

const mockClearNotificationFailed = vi.fn();
const mockRequestNotificationPermission = vi.fn();
const mockUseNotification = vi.fn();
vi.mock("@/features/countdown-timer/hooks/useNotification", () => ({
  __esModule: true,
  default: () => mockUseNotification(),
}));

import NotificationStatus from "@/features/countdown-timer/components/NotificationStatus";

function defaultMock() {
  return {
    notificationPermission: "default",
    notificationFailed: false,
    clearNotificationFailed: mockClearNotificationFailed,
    requestNotificationPermission: mockRequestNotificationPermission,
  };
}

describe("NotificationStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTimerRunning.mockReturnValue(false);
    mockUseNotification.mockReturnValue(defaultMock());
  });

  it("should not render when timer is not running and notification didn't fail", () => {
    mockUseTimerRunning.mockReturnValue(false);
    mockUseNotification.mockReturnValue({
      ...defaultMock(),
      notificationPermission: "denied",
    });

    const { container } = render(<NotificationStatus />);

    expect(container.innerHTML).toBe("");
  });

  it("should not render when timer is running and permission is granted", () => {
    mockUseTimerRunning.mockReturnValue(true);
    mockUseNotification.mockReturnValue({
      ...defaultMock(),
      notificationPermission: "granted",
    });

    const { container } = render(<NotificationStatus />);

    expect(container.innerHTML).toBe("");
  });

  it("should show warning when timer is running and permission is denied", () => {
    mockUseTimerRunning.mockReturnValue(true);
    mockUseNotification.mockReturnValue({
      ...defaultMock(),
      notificationPermission: "denied",
    });

    render(<NotificationStatus />);

    expect(
      screen.getByText(/Desktop notifications are disabled/i),
    ).toBeInTheDocument();
  });

  it("should show warning when timer is running and permission is default", () => {
    mockUseTimerRunning.mockReturnValue(true);
    mockUseNotification.mockReturnValue({
      ...defaultMock(),
      notificationPermission: "default",
    });

    render(<NotificationStatus />);

    expect(
      screen.getByText(/Desktop notifications are disabled/i),
    ).toBeInTheDocument();
  });

  it("should include role alert for accessibility", () => {
    mockUseTimerRunning.mockReturnValue(true);
    mockUseNotification.mockReturnValue({
      ...defaultMock(),
      notificationPermission: "denied",
    });

    render(<NotificationStatus />);

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
  });

  it("should show enable notifications button in the warning", () => {
    mockUseTimerRunning.mockReturnValue(true);
    mockUseNotification.mockReturnValue({
      ...defaultMock(),
      notificationPermission: "denied",
    });

    render(<NotificationStatus />);

    expect(
      screen.getByRole("button", { name: /enable notifications/i }),
    ).toBeInTheDocument();
  });

  it("should call requestNotificationPermission when enable button is clicked", async () => {
    const user = userEvent.setup();
    mockUseTimerRunning.mockReturnValue(true);
    mockUseNotification.mockReturnValue({
      ...defaultMock(),
      notificationPermission: "denied",
    });

    render(<NotificationStatus />);

    const enableButton = screen.getByRole("button", {
      name: /enable notifications/i,
    });
    await user.click(enableButton);

    expect(mockRequestNotificationPermission).toHaveBeenCalledTimes(1);
  });

  it("should show error alert when notification failed", () => {
    mockUseTimerRunning.mockReturnValue(false);
    mockUseNotification.mockReturnValue({
      ...defaultMock(),
      notificationPermission: "denied",
      notificationFailed: true,
    });

    render(<NotificationStatus />);

    expect(
      screen.getByText(/Desktop notification was not sent/i),
    ).toBeInTheDocument();
  });

  it("should show error alert even when timer is running and notification failed", () => {
    mockUseTimerRunning.mockReturnValue(true);
    mockUseNotification.mockReturnValue({
      ...defaultMock(),
      notificationPermission: "denied",
      notificationFailed: true,
    });

    render(<NotificationStatus />);

    expect(
      screen.getByText(/Desktop notification was not sent/i),
    ).toBeInTheDocument();
  });

  it("should call clearNotificationFailed when dismiss button is clicked", async () => {
    const user = userEvent.setup();
    mockUseTimerRunning.mockReturnValue(false);
    mockUseNotification.mockReturnValue({
      ...defaultMock(),
      notificationPermission: "denied",
      notificationFailed: true,
    });

    render(<NotificationStatus />);

    const dismissButton = screen.getByRole("button", { name: /✕/ });
    await user.click(dismissButton);

    expect(mockClearNotificationFailed).toHaveBeenCalledTimes(1);
  });

  it("should include role alert for error alert accessibility", () => {
    mockUseTimerRunning.mockReturnValue(false);
    mockUseNotification.mockReturnValue({
      ...defaultMock(),
      notificationPermission: "denied",
      notificationFailed: true,
    });

    render(<NotificationStatus />);

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
  });
});
