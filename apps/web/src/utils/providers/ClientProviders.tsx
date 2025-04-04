"use client";

import React, { type ReactNode } from "react";
import { ThemeProvider } from "utils/context/themeContext";
import { ToastProvider } from "utils/context/toastContext";
import { DrawerProvider } from "utils/context/drawerContext";
import { NotificationProvider } from "utils/context/notificationContext";
import { APIProvider } from "@vis.gl/react-google-maps";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <DrawerProvider>
          <NotificationProvider>
            <APIProvider
              apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
            >
              {children}
            </APIProvider>
          </NotificationProvider>
        </DrawerProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
