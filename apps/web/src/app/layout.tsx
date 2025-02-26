import "./globals.scss";
import { ClientProviders } from "utils/providers/ClientProviders";
import Drawer from "views/drawer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Tournament App" />
      </head>
      <body>
        <ClientProviders>
          {children}
          <Drawer />
        </ClientProviders>
      </body>
    </html>
  );
}
