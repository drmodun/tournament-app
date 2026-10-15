import { AxiosError } from "axios";
import { handleError } from "utils/mixins/helpers";

type Toaster = {
  addToast: (message: string, type: "success" | "error" | "info") => void;
};

/**
 * Shared mutation callbacks: an "info" toast while the request is pending and
 * an "error" toast with the API's message when it fails.
 */
export const toastHandlers = (toast: Toaster, pendingMessage: string) => ({
  onError: (e: AxiosError<{ message: string & string[] }>) => {
    const err = handleError(e);
    err && toast.addToast(err, "error");
  },
  onMutate: () => {
    toast.addToast(pendingMessage, "info");
  },
});
