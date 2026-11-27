import { vi } from "vitest";
import { createElement } from "react";
import { matchRoutes, Navigate } from "react-router";
import NotFoundRoute from "@/app/routes/404";

vi.mock("@atomic-editor/editor", () => ({
  AtomicCodeMirrorEditor: () => null,
}));

import { router } from "@/app/router";

const getMatchedRoute = (pathname: string) => {
  const matches = matchRoutes(router.routes, pathname);
  return matches?.[matches.length - 1]?.route;
};

describe("application routes", () => {
  it("registers all personal pages under the default app layout", () => {
    const personalPaths = [
      "/my/profile",
      "/my/journal",
      "/my/brain-dump",
      "/my/calendar",
      "/my/tasks",
    ];

    personalPaths.forEach((pathname) => {
      const matches = matchRoutes(router.routes, pathname);

      expect(matches?.[0]?.route.path).toBe("/");
      expect(matches?.some(({ route }) => route.path === "my")).toBe(true);
      expect(matches?.[matches.length - 1]?.route.element).toBeDefined();
    });
  });

  it.each([
    ["/profile", "/my/profile"],
    ["/journal", "/my/journal"],
    ["/calendar", "/my/calendar"],
    ["/tasks", "/my/tasks"],
    ["/my", "/my/profile"],
  ])("replaces %s with %s", (pathname, destination) => {
    expect(getMatchedRoute(pathname)?.element).toEqual(
      createElement(Navigate, { to: destination, replace: true }),
    );
  });

  it("renders the existing not found page for unknown personal paths", () => {
    expect(getMatchedRoute("/my/unknown")?.element).toEqual(
      createElement(NotFoundRoute),
    );
  });

  it("keeps the home, authentication, and settings route groups", () => {
    expect(getMatchedRoute("/")).toBeDefined();
    expect(getMatchedRoute("/auth/login")).toBeDefined();
    expect(getMatchedRoute("/auth/signup")).toBeDefined();
    expect(getMatchedRoute("/settings")).toBeDefined();
    expect(getMatchedRoute("/settings/themes")).toBeDefined();
    expect(getMatchedRoute("/settings/timer")).toBeDefined();
    expect(getMatchedRoute("/settings/calendar")).toBeDefined();
    expect(getMatchedRoute("/someone/profile")).toBeUndefined();
  });
});
