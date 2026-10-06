import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Siam — Business Development & Market Analysis",
  description:
    "Portfolio of Siam, business development lead and head of market analysis, with experience in data analysis and an interest in animation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
