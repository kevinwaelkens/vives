import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/data/providers";
import { Toaster } from "sonner";
import { SessionDebug } from "@/components/debug/SessionDebug";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "School Management System",
  description:
    "Comprehensive school management platform for tracking students, assignments, and assessments",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
          <SessionDebug />
        </Providers>
      </body>
    </html>
  );
}
