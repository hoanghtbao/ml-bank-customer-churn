"use client";

import { usePathname } from "next/navigation";
import { useSidebar } from "./AppShell";
import {
  PanelLeftClose,
  PanelLeft,
  Search,
  Bell,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";

const ROUTE_TITLES: Record<string, { title: string; section: string }> = {
  "/": { title: "Tổng Quan Hồ Sơ & Kiến Trúc", section: "EuroVanguard" },
  "/dashboard": { title: "Báo Cáo Điều Hành Danh Mục", section: "Descriptive & Diagnostic" },
  "/advisor": { title: "Tư Vấn Giữ Chân 1-1 (SLA 4h)", section: "Predictive & Prescriptive" },
  "/batch": { title: "Chấm Điểm Danh Mục Khách Hàng", section: "Campaign Operations" },
  "/strategy": { title: "Chiến Lược 4 Quadrants & Tiered ROI", section: "Financial Planning" },
  "/governance": { title: "Quản Trị Mô Hình & SHAP", section: "Risk & AI Ethics" },
};

export default function TopNavbar() {
  const pathname = usePathname();
  const { collapsed, toggleSidebar } = useSidebar();
  const currentRoute = ROUTE_TITLES[pathname] || { title: "Phân Hệ Nghiệp Vụ", section: "EuroVanguard" };
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
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between gap-4 transition-all">
      {/* Left: Sidebar Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          title={collapsed ? "Mở rộng thanh điều hướng (Ctrl + B)" : "Thu gọn thanh điều hướng (Ctrl + B)"}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200/80 shadow-xs flex items-center justify-center cursor-pointer group"
        >
          {collapsed ? (
            <PanelLeft className="w-5 h-5 text-blue-600 transition-transform group-hover:scale-110" />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-slate-600 transition-transform group-hover:scale-110" />
          )}
        </button>

        <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{currentRoute.section}</span>
            <span>/</span>
            <span className="font-semibold text-slate-800">{currentRoute.title}</span>
          </div>
        </div>
      </div>

      {/* Center: Search & Filter Box */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng theo ID, Họ, Quốc gia..."
            className="w-full pl-10 pr-12 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-500 font-semibold border border-slate-300/60">
              ⌘K
            </span>
          </div>
        </div>
      </div>

      {/* Right: Operational Status Badges & Profile */}
      <div className="flex items-center gap-3">
        {/* Market Time */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600 border border-slate-200/70">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Frankfurt:</span>
          <span className="font-mono font-semibold text-slate-800">{timeStr || "13:00 CET"}</span>
        </div>

        {/* AI Champion Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[11px] font-semibold text-blue-700 border border-blue-200/80">
          <Cpu className="w-3.5 h-3.5 text-blue-600" />
          <span>XGBoost Proactive</span>
          <span className="px-1.5 py-0.2 rounded bg-blue-200/70 text-blue-900 text-[10px] font-bold">T* 0.45</span>
        </div>

        {/* FastAPI Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="hidden sm:inline">FastAPI Live</span>
          <span className="text-[10px] font-mono text-emerald-800">&lt;15ms</span>
        </div>

        {/* User Profile Capsule */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            HB
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">Hoàng Hữu Bảo</div>
            <div className="text-[10px] text-slate-500 font-medium">Senior CVM Analyst</div>
          </div>
        </div>
      </div>
    </header>
  );
}
