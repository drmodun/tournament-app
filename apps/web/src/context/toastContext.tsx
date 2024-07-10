"use client";

import { createContext, ReactNode, useState } from "react";
import { ToastProps, ToastVariants } from "../types/toastTypes";

export const ToastContext = createContext({
  toasts: [] as ToastProps[],
  addToast: (message: string, type: ToastVariants) => {},
  removeToast: (id: number) => {},
});

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([
    { message: "Hi", type: "info", id: 1 },
  ]);
  const [autoClose, setAutoClose] = useState<boolean>(true);
  const [autoCloseDuration, setAutoCloseDuration] = useState<number>(6000);

  const addToast = (message: string, type: ToastVariants, id?: number) => {
    id = id ?? Date.now();
    const newToasts = [...toasts, { message, type, id }];
    setToasts(newToasts);
    if (autoClose) {
      setTimeout(() => {
        removeToast(id);
      }, autoCloseDuration);
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

/*
 const [toasts, setToasts] = useState<ToastProps[]>(data);
  const [autoClose, setAutoClose] = useState<boolean>(true);
  const [autoCloseDuration, setAutoCloseDuration] = useState<number>(6000);

  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    onRemoveToast && onRemoveToast();
  };

  const addToast = (message, type) => {
    const id = Date.now();
    const newToasts: ToastProps[] = [{ message, type, id }, ...toasts];
    setToasts(newToasts);

    if (autoClose) {
      setTimeout(() => {
        removeToast(id);
      }, autoCloseDuration);
    }
  };
*/
