import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "BB Bank — Enterprise Churn Analytics & Retention DSS",
  description: "Enterprise Machine Learning & Retention Decision Support System for Retail Banking (France, Germany, Spain)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-blue-600 selection:text-white">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
