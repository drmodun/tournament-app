"use client";

import { createContext, ReactNode, useState } from "react";
import { ToastProps, ToastVariants } from "../types/toastTypes";

export const ToastContext = createContext({
  toasts: [] as ToastProps[],
  addToast: (message: string, type: ToastVariants) => {
    message;
    type;
  },
  removeToast: (id: number) => {
    id;
  },
});

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  const AUTO_CLOSE = true;
  const AUTO_CLOSE_DURATION = 6000;

  const addToast = (message: string, type: ToastVariants, id?: number) => {
    id = id ?? Date.now();
    const newToasts = [...toasts, { message, type, id }];
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
    </ToastContext.Provider>
  );
};
