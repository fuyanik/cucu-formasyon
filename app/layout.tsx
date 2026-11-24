import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mi Cucu · Formasyon",
  description: "3 önde 2 arkada dizilimden tek sıraya geçiş: müzikle senkron animasyon",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
