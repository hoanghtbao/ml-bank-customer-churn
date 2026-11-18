"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

interface SidebarContextType {
  collapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  toggleSidebar: () => {},
  setCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("eurovanguard_sidebar_collapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
  }, []);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("eurovanguard_sidebar_collapsed", String(next));
      return next;
    });
  };

  return (
    <SidebarContext.Provider value={{ collapsed, toggleSidebar, setCollapsed }}>
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
            collapsed ? "ml-20" : "ml-64"
          }`}
        >
          {/* Top Modern Enterprise Navbar */}
          <TopNavbar />

          {/* Dynamic Page Content */}
          <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>

          {/* Enterprise Footer */}
          <footer className="px-8 py-4 border-t border-slate-200/80 bg-white/50 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-slate-700">EuroVanguard Bank AG</span> &bull; Customer Value Management & Churn DSS &bull; Production v2.4
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Độc quyền nội bộ Hội đồng Tín Dụng & Khối Bán Lẻ</span>
              <span>&bull;</span>
              <span>Bảo mật Cấp độ 3 (GDPR / Basel III)</span>
            </div>
          </footer>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
