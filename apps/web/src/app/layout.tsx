"use client";

import "./globals.scss";
import globals from "styles/globals.module.scss";
import { ToastProvider } from "utils/context/toastContext";
import { DrawerProvider } from "utils/context/drawerContext";
import Drawer from "views/drawer";
import { ThemeProvider } from "utils/context/themeContext";
import { useThemeContext } from "utils/hooks/useThemeContext";
import { APIProvider } from "@vis.gl/react-google-maps";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <ThemeProvider>
        <APIProvider apiKey={""}>
          <body
            className={globals[`${useThemeContext().theme}BackgroundColor`]}
          >
            <ToastProvider>
              <DrawerProvider>
                {children}
                <Drawer />
              </DrawerProvider>
            </ToastProvider>
          </body>
        </APIProvider>
      </ThemeProvider>
    </html>
  );
}
