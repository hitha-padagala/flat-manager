import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flat Manager",
  description: "Manage your flat society",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
