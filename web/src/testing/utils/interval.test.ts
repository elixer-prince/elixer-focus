import { clearIntervalIfItExists } from "@/utils/interval";

describe("clearIntervalIfItExists", () => {
  let clearIntervalMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // spy on global clearInterval so we can track if it gets called
    clearIntervalMock = vi.spyOn(globalThis, "clearInterval");
  });

  afterEach(() => {
    // restore the original function
    clearIntervalMock.mockRestore();
  });

  it("should clear the interval if there is one", () => {
    // create the interval
    const testInterval = setInterval(() => {}, 1000);

    // wrap it in an object to match your function's expected input
    const intervalRef = { current: testInterval };

    // call the function
    clearIntervalIfItExists(intervalRef);

    // assertions
    expect(clearIntervalMock).toHaveBeenCalledWith(testInterval);
    expect(intervalRef.current).toBeNull();
  });

  it("should do nothing if current is null", () => {
    const intervalRef = { current: null };

    clearIntervalIfItExists(intervalRef);

    expect(clearIntervalMock).not.toHaveBeenCalled();
    expect(intervalRef.current).toBeNull();
  });
});
