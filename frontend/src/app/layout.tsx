import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "EuroVanguard Bank - Churn Analytics & Retention DSS",
  description: "Enterprise Machine Learning & Retention Decision Support System for Retail Banking (France, Germany, Spain)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 flex">
        <Sidebar />
        <main className="ml-64 flex-1 p-8 max-w-7xl">
          {children}
        </main>
      </body>
    </html>
  );
}
