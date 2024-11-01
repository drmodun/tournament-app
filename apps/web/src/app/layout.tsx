import "./globals.scss";
import { ToastProvider } from "utils/context/toastContext";
import { DrawerProvider } from "utils/context/drawerContext";
import Drawer from "views/drawer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <DrawerProvider>
            {children}
            <Drawer />
          </DrawerProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
