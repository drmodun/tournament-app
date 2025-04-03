import { MouseEventHandler } from "react";

/// Type that includes the variants of the toast component:
export type ToastVariants = "success" | "error" | "info" | "warning";

export interface ToastProps {
  style?: React.CSSProperties;
  message?: string;
  type?: ToastVariants;
  href?: string;
  id?: number;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  autoClose?: boolean;
}

/// Map that joins a toast type to its color:
export const TOAST_TYPE_COLOR_MAP = {
  success: "primary",
  error: "danger",
  info: "secondary",
  warning: "warning",
};
export const AUTO_CLOSE = true;
export const AUTO_CLOSE_DURATION = 6000;
