import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import PublicChrome from "../components/PublicChrome";

export const metadata: Metadata = {
  title: "Ringo | Modern Team Communication",
  description:
    "A Discord-inspired communication platform for focused teams and communities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <Providers>
          <PublicChrome>{children}</PublicChrome>
        </Providers>
      </body>
    </html>
  );
}
