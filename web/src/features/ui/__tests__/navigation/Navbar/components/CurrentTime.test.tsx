import CurrentTime from "@/features/ui/navigation/Navbar/components/CurrentTime";
import { render, screen } from "@testing-library/react";

// Mocks

const currentTimeMock = vi.fn();

vi.mock("@/stores/date", () => ({
  useCurrentTime: () => currentTimeMock(),
}));

// Setup

beforeEach(() => {
  vi.clearAllMocks();

  currentTimeMock.mockReturnValue("10:45 AM");
});

// Tests

describe("CurrentTime", () => {
  it("should render an article element", () => {
    render(<CurrentTime />);

    const currentTimeElement = screen.getByRole("article", {
      name: /current time/i,
    });

    expect(currentTimeElement).toBeInTheDocument();
  });

  it("should render the current time", () => {
    render(<CurrentTime />);

    const currentTimeElement = screen.getByRole("article", {
      name: /current time/i,
    });

    expect(currentTimeElement).toHaveTextContent("10:45 AM");
  });
});
