import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flat Manager",
  description: "Manage your flat society",
  icons:{
    icon: "/favicon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
