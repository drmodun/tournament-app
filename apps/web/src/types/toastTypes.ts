import { MouseEventHandler } from "react";
import { DANGER, PRIMARY, SECONDARY, WARNING } from "./styleTypes";

/// Type that includes the variants of the toast component:
export type ToastVariants = "success" | "error" | "info" | "warning";

export interface ToastProps {
  style?: React.CSSProperties;
  message?: string;
  type?: ToastVariants;
  id?: number;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

/// Map that joins a toast type to its color:
export const TOAST_TYPE_COLOR_MAP = {
  success: PRIMARY,
  error: DANGER,
  info: SECONDARY,
  warning: WARNING,
};
