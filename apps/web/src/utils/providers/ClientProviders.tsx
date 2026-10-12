"use client";

import React, { type ReactNode } from "react";
import { ThemeProvider } from "utils/context/themeContext";
import { ToastProvider } from "utils/context/toastContext";
import { DrawerProvider } from "utils/context/drawerContext";
import { NotificationProvider } from "utils/context/notificationContext";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <DrawerProvider>
          <NotificationProvider>
            {children}
          </NotificationProvider>
        </DrawerProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
