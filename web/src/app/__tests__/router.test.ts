import { vi } from "vitest";

vi.mock("@atomic-editor/editor", () => ({
  AtomicCodeMirrorEditor: () => null,
}));

import { router } from "@/app/router";

describe("application routes", () => {
  it("registers the Brain dump page under the default app layout", () => {
    const defaultRoute = router.routes.find((route) => route.path === "/");
    const brainDumpRoute = defaultRoute?.children?.find(
      (route) => route.path === "my/brain-dump",
    );

    expect(brainDumpRoute).toBeDefined();
  });
});
