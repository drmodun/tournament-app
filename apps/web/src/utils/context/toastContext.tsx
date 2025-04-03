"use client";

import ToastList from "components/toastList";
import { createContext, ReactNode, useState } from "react";
import {
  AUTO_CLOSE,
  AUTO_CLOSE_DURATION,
  ToastProps,
  ToastVariants,
} from "types/toastTypes";

export const ToastContext = createContext({
  toasts: [] as ToastProps[],
  addToast: (message: string, type: ToastVariants, href?: string) => {
    message;
    type;
    href;
  },
  removeToast: (id: number) => {
    id;
  },
});

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (
    message: string,
    type: ToastVariants,
    href?: string,
    id?: number,
  ) => {
    id = id ?? Date.now();
    const newToasts = [...toasts, { message, type, href, id }];
    setToasts(newToasts);
    if (AUTO_CLOSE) {
      setTimeout(() => {
        id && removeToast(id);
      }, AUTO_CLOSE_DURATION);
    }
  };

  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastList />
    </ToastContext.Provider>
  );
};
