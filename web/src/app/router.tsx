import AuthLayout from "@/app/layout/Auth";
import DefaultLayout from "@/app/layout/Default";
import SettingsLayout from "@/app/layout/Settings";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import HomeRoute from "@/app/routes/(root)/Index";
import JournalRoute from "@/app/routes/my/Journal";
import ProfileRoute from "@/app/routes/my/Profile";
import TasksRoute from "@/app/routes/my/Tasks";
import NotFoundRoute from "@/app/routes/404";
import LoginRoute from "@/app/routes/auth/Login";
import SignUpRoute from "@/app/routes/auth/SignUp";
import ThemeRoute from "@/app/routes/settings/Theme";
import TimerRoute from "@/app/routes/settings/Timer";
import CalendarSettingsRoute from "@/app/routes/settings/Calendar";
import { Spinner } from "@/components/ui";
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router";

const CalendarRoute = lazy(() => import("@/app/routes/my/Calendar"));
const BrainDumpRoute = lazy(() => import("@/app/routes/my/BrainDump"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <DefaultLayout />
      </ErrorBoundary>
    ),
    errorElement: <NotFoundRoute />,
    children: [
      {
        path: "",
        element: <HomeRoute />,
      },
      {
        path: "my",
        children: [
          {
            index: true,
            element: <Navigate to="/my/profile" replace />,
          },
          {
            path: "profile",
            element: <ProfileRoute />,
          },
          {
            path: "journal",
            element: <JournalRoute />,
          },
          {
            path: "brain-dump",
            element: (
              <Suspense
                fallback={
                  <div
                    className="flex min-h-64 items-center justify-center gap-3"
                    role="status"
                  >
                    <Spinner aria-hidden="true" size="lg" />
                    <span className="sr-only">Loading Brain dump…</span>
                  </div>
                }
              >
                <BrainDumpRoute />
              </Suspense>
            ),
          },
          {
            path: "calendar",
            element: (
              <Suspense
                fallback={
                  <div
                    className="flex min-h-64 items-center justify-center gap-3"
                    role="status"
                  >
                    <Spinner aria-hidden="true" size="lg" />
                    <span className="sr-only">Loading Calendar…</span>
                  </div>
                }
              >
                <CalendarRoute />
              </Suspense>
            ),
          },
          {
            path: "tasks",
            element: <TasksRoute />,
          },
          {
            path: "*",
            element: <NotFoundRoute />,
          },
        ],
      },
      {
        path: "profile",
        element: <Navigate to="/my/profile" replace />,
      },
      {
        path: "journal",
        element: <Navigate to="/my/journal" replace />,
      },
      {
        path: "calendar",
        element: <Navigate to="/my/calendar" replace />,
      },
      {
        path: "tasks",
        element: <Navigate to="/my/tasks" replace />,
      },
    ],
  },
  {
    path: "/auth",
    element: (
      <ErrorBoundary>
        <AuthLayout />
      </ErrorBoundary>
    ),
    children: [
      {
        path: "login",
        element: <LoginRoute />,
      },
      {
        path: "signup",
        element: <SignUpRoute />,
      },
    ],
  },
  {
    path: "/settings",
    element: (
      <ErrorBoundary>
        <SettingsLayout />
      </ErrorBoundary>
    ),
    children: [
      {
        path: "",
        element: <ProfileRoute />,
      },
      {
        path: "themes",
        element: <ThemeRoute />,
      },
      {
        path: "timer",
        element: <TimerRoute />,
      },
      {
        path: "calendar",
        element: <CalendarSettingsRoute />,
      },
    ],
  },
]);
