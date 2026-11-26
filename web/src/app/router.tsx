import AuthLayout from "@/app/layout/Auth";
import DefaultLayout from "@/app/layout/Default";
import SettingsLayout from "@/app/layout/Settings";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import HomeRoute from "@/app/routes/(root)/Index";
import JournalRoute from "@/app/routes/(root)/Journal";
import ProfileRoute from "@/app/routes/(root)/Profile";
import TasksRoute from "@/app/routes/(root)/Tasks";
import NotFoundRoute from "@/app/routes/404";
import LoginRoute from "@/app/routes/auth/Login";
import SignUpRoute from "@/app/routes/auth/SignUp";
import ThemeRoute from "@/app/routes/settings/Theme";
import TimerRoute from "@/app/routes/settings/Timer";
import CalendarSettingsRoute from "@/app/routes/settings/Calendar";
import { Spinner } from "@/components/ui";
import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";

const CalendarRoute = lazy(() => import("@/app/routes/(root)/Calendar"));
const BinRoute = lazy(() => import("@/app/routes/(root)/Bin"));

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
        path: "profile",
        element: <ProfileRoute />,
      },
      {
        path: "journal",
        element: <JournalRoute />,
      },
      {
        path: "my/brain-dump",
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
            <BinRoute />
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
