"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";

export type ThemeMode = "light" | "dark";

interface SidebarContextType {
  collapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (v: boolean) => void;
}

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (t: ThemeMode) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  toggleSidebar: () => {},
  setCollapsed: () => {},
});

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export const useSidebar = () => useContext(SidebarContext);
export const useTheme = () => useContext(ThemeContext);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setThemeState] = useState<ThemeMode>("light");

  useEffect(() => {
    const savedCollapsed = localStorage.getItem("bb_bank_sidebar_collapsed");
    const savedTheme = localStorage.getItem("bb_bank_theme") as ThemeMode | null;
    const initialTheme: ThemeMode = savedTheme === "dark" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", initialTheme === "dark");

    queueMicrotask(() => {
      if (savedCollapsed !== null) {
        setCollapsed(savedCollapsed === "true");
      }
      setThemeState(initialTheme);
    });
  }, []);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("bb_bank_sidebar_collapsed", String(next));
      return next;
    });
  };

  const setTheme = (t: ThemeMode) => {
    setThemeState(t);
    localStorage.setItem("bb_bank_theme", t);
    document.documentElement.classList.toggle("dark", t === "dark");
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <SidebarContext.Provider value={{ collapsed, toggleSidebar, setCollapsed }}>
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
          {/* Left Sidebar */}
          <Sidebar />

          {/* Main Content Area (min-w-0 prevents horizontal flex overflow) */}
          <div
            className={`flex-1 min-w-0 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
              collapsed ? "ml-20" : "ml-64"
            }`}
          >
            {/* Top Modern Enterprise Navbar */}
            <TopNavbar />

            {/* Dynamic Page Content */}
            <main className="flex-1 p-5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>

            {/* Enterprise Footer */}
            <footer className="px-6 sm:px-8 py-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 transition-colors">
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  BB Bank AG
                </span>{" "}
                &bull; Customer Value Management &amp; Churn DSS &bull; Production v2.4
              </div>
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <span>Độc quyền nội bộ Hội đồng Tín Dụng &amp; Khối Bán Lẻ</span>
                <span>&bull;</span>
                <span>GDPR Art. 22 / Basel III</span>
              </div>
            </footer>
          </div>
        </div>
      </SidebarContext.Provider>
    </ThemeContext.Provider>
  );
}
