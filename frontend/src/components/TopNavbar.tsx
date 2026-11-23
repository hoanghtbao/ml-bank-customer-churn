"use client";

import { usePathname } from "next/navigation";
import { useSidebar, useTheme } from "./AppShell";
import {
  PanelLeftClose,
  PanelLeft,
  Search,
  Cpu,
  Clock,
  Sun,
  Moon,
} from "lucide-react";
import { useState, useEffect } from "react";

const ROUTE_TITLES: Record<string, { title: string; section: string }> = {
  "/": { title: "Tổng Quan Hồ Sơ & Kiến Trúc", section: "BB Bank" },
  "/dashboard": { title: "Báo Cáo Điều Hành Danh Mục", section: "Descriptive & Diagnostic" },
  "/advisor": { title: "Tư Vấn Giữ Chân 1-1 (SLA 4h)", section: "Predictive & Prescriptive" },
  "/batch": { title: "Chấm Điểm Danh Mục Khách Hàng", section: "Campaign Operations" },
  "/strategy": { title: "Chiến Lược 4 Quadrants & Tiered ROI", section: "Financial Planning" },
  "/governance": { title: "Quản Trị Mô Hình & SHAP", section: "Risk & AI Ethics" },
};

export default function TopNavbar() {
  const pathname = usePathname();
  const { collapsed, toggleSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const currentRoute = ROUTE_TITLES[pathname] || { title: "Phân Hệ Nghiệp Vụ", section: "BB Bank" };
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Europe/Paris",
        }) + " CET"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 lg:px-6 py-3 flex items-center justify-between gap-3 transition-colors duration-200">
      {/* Left: Sidebar Toggle & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          aria-label={collapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
          title={collapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center justify-center cursor-pointer shrink-0"
        >
          {collapsed ? (
            <PanelLeft className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block shrink-0" />

        <div className="hidden sm:flex items-center gap-1.5 text-xs truncate">
          <span className="text-slate-500 dark:text-slate-400 truncate">
            {currentRoute.section}
          </span>
          <span className="text-slate-400 dark:text-slate-600">/</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
            {currentRoute.title}
          </span>
        </div>
      </div>

      {/* Center: Quick Search Box (only on large viewports so badges never clip) */}
      <div className="hidden 2xl:flex items-center flex-1 max-w-xs mx-2">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Tìm kiếm nhanh khách hàng"
            placeholder="Tìm khách hàng theo ID, Họ..."
            className="w-full pl-9 pr-10 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border border-slate-300/60 dark:border-slate-700">
            Ctrl+K
          </span>
        </div>
      </div>

      {/* Right: Operational Badges, Light/Dark Toggle & Profile */}
      <div className="flex items-center gap-2 lg:gap-2.5 shrink-0">
        {/* Market Time */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Frankfurt:</span>
          <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {timeStr || "13:00 CET"}
          </span>
        </div>

        {/* AI Champion Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[11px] font-semibold text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 whitespace-nowrap">
          <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>XGBoost</span>
          <span className="px-1.5 py-0.2 rounded bg-blue-200/70 dark:bg-blue-900 text-blue-900 dark:text-blue-200 text-[10px] font-bold">
            T* 0,45
          </span>
        </div>

        {/* FastAPI Status Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 whitespace-nowrap">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>FastAPI Live</span>
        </div>

        {/* LIGHT / DARK THEME TOGGLE SWITCH */}
        <button
          onClick={toggleTheme}
          aria-label={theme === "light" ? "Chuyển sang giao diện Tối" : "Chuyển sang giao diện Sáng"}
          title={theme === "light" ? "Chuyển sang giao diện Tối (Dark Mode)" : "Chuyển sang giao diện Sáng (Light Mode)"}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-900 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
        >
          {theme === "light" ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Sáng</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Tối</span>
            </>
          )}
        </button>

        {/* User Profile Capsule */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
            HB
          </div>
          <div className="hidden xl:block text-left leading-tight">
            <div className="text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">
              Hoàng Hữu Bảo
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
              Senior CVM Analyst
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
