import toast from "react-hot-toast";

interface ErrorToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}

const defaultErrorTitle = "Something went wrong";

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return defaultErrorTitle;
}

export function useErrorToast() {
  const showError = (error: unknown, options?: ErrorToastOptions) => {
    const title = options?.title ?? defaultErrorTitle;
    const description = options?.description ?? extractErrorMessage(error);
    const duration = options?.duration ?? 4000;

    toast.error(`${title}: ${description}`, { duration });
  };

  return { showError };
}

export default useErrorToast;
