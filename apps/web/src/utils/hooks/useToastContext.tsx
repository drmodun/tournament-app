import { useContext } from "react";
import { ToastContext } from "utils/context/toastContext";

export const useToastContext = () => useContext(ToastContext);
