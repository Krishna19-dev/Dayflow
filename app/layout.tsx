import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dayflow HRMS — Enterprise Workforce Management",
  description:
    "A full-stack Human Resource Management System for modern organizations, attendance tracking, leave workflows, and dynamic payroll calculations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background text-text-primary antialiased font-sans flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
