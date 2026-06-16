import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/general/AuthProvider";
import { Navbar } from "@/components/general/Navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { ConditionalFooter } from "@/components/general/ConditionalFooter";

export const metadata: Metadata = {
  title: "Nasacy",
  description: "A premium space for industry thought leaders and professional writers to share deep insights on technology and design.",
};

import { ToastContainer } from "@/components/ui/Toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body className="bg-surface text-on-surface font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <ConditionalFooter />
            <ToastContainer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
