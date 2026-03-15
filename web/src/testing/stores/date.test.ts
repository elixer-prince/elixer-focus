import { act, renderHook } from "@testing-library/react";

const formatMock = vi.fn();
const dayjsMock = vi.fn(() => ({
  format: formatMock,
}));

vi.mock("dayjs", () => ({
  default: dayjsMock,
}));

const loadStore = async () => {
  vi.resetModules();
  return await import("@/stores/date");
};

describe("Date Store", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with a formatted current time and default format", async () => {
    formatMock.mockReturnValueOnce("10:45:12 AM");

    const { useCurrentTime, useTimeFormat } = await loadStore();

    expect(renderHook(() => useCurrentTime()).result.current).toBe(
      "10:45:12 AM",
    );
    expect(renderHook(() => useTimeFormat()).result.current).toBe(
      "hh:mm:ss A",
    );
    expect(dayjsMock).toHaveBeenCalledTimes(1);
    expect(formatMock).toHaveBeenCalledWith("hh:mm:ss A");
  });

  it("should update the current time using the default format", async () => {
    formatMock
      .mockReturnValueOnce("10:00:00 AM")
      .mockReturnValueOnce("10:00:05 AM");

    const { useCurrentTime, useUpdateCurrentTime } = await loadStore();

    const currentTime = renderHook(() => useCurrentTime()).result;
    const updateCurrentTime = renderHook(() => useUpdateCurrentTime()).result;

    expect(currentTime.current).toBe("10:00:00 AM");

    act(() => {
      updateCurrentTime.current();
    });

    expect(currentTime.current).toBe("10:00:05 AM");
    expect(formatMock).toHaveBeenCalledWith("hh:mm:ss A");
  });

  it("should set the time format", async () => {
    formatMock.mockReturnValueOnce("09:15:30 AM");

    const { useTimeFormat, useSetTimeFormat } = await loadStore();

    const timeFormat = renderHook(() => useTimeFormat()).result;
    const setTimeFormat = renderHook(() => useSetTimeFormat()).result;

    act(() => {
      setTimeFormat.current("HH:mm");
    });

    expect(timeFormat.current).toBe("HH:mm");
  });
});
