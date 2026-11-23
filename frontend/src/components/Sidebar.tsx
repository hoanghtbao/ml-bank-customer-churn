"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./AppShell";
import {
  Landmark,
  LayoutDashboard,
  UserCheck,
  FileSpreadsheet,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

const NAV_ITEMS = [
  {
    name: "Tổng Quan Hồ Sơ",
    href: "/",
    icon: Landmark,
    description: "Bản đồ 3 quốc gia & 4 tầng phân tích",
    badge: "Gartner",
  },
  {
    name: "Báo Cáo Điều Hành",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Dual Baseline & Tâm chấn Đức",
    badge: "Descriptive",
  },
  {
    name: "Tư Vấn Giữ Chân 1-1",
    href: "/advisor",
    icon: UserCheck,
    description: "SLA 4h, What-If & Kịch bản RM",
    badge: "SLA 4h",
  },
  {
    name: "Chấm Điểm Danh Mục",
    href: "/batch",
    icon: FileSpreadsheet,
    description: "Lưới Excel & Xuất danh sách",
    badge: "10k KH",
  },
  {
    name: "Chiến Lược & ROI",
    href: "/strategy",
    icon: TrendingUp,
    description: "4 Quadrants & Mô phỏng lợi nhuận",
    badge: "Tiered ROI",
  },
  {
    name: "Quản Trị Mô Hình AI",
    href: "/governance",
    icon: ShieldCheck,
    description: "Decile Lift, Ablation & Đạo đức AI",
    badge: "Basel III",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed } = useSidebar();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white dark:bg-[#091426] text-slate-700 dark:text-slate-200 border-r border-slate-200/90 dark:border-slate-800/80 flex flex-col justify-between z-50 transition-all duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header (Sidebar collapse/expand toggle lives canonically in TopNavbar) */}
      <div>
        <div
          className={`h-16 flex items-center border-b border-slate-200/80 dark:border-slate-800/90 transition-all ${
            collapsed ? "justify-center px-2" : "justify-start px-4"
          }`}
        >
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform shrink-0">
              <Landmark className="w-5 h-5 text-white" />
            </div>

            {!collapsed && (
              <div className="min-w-0 overflow-hidden">
                <div className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white leading-tight">
                  BB BANK
                </div>
                <div className="text-[9px] font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase">
                  Bank Decision Support
                </div>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className={`py-4 space-y-1.5 ${collapsed ? "px-2" : "px-3"}`} aria-label="Điều hướng chính">
          {!collapsed && (
            <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Phân Hệ Nghiệp Vụ
            </div>
          )}

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <div key={item.href} className="relative group">
                <Link
                  href={item.href}
                  className={`flex items-center rounded-xl font-medium transition-all cursor-pointer ${
                    collapsed
                      ? "justify-center p-3"
                      : "justify-between px-3 py-2.5 text-xs"
                  } ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/25 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                        isActive ? "text-white" : "text-slate-500 dark:text-slate-400"
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </div>

                  {!collapsed && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono font-semibold shrink-0 ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>

                {/* Floating Tooltip when Collapsed */}
                {collapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-slate-900 text-white border border-slate-700/80 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 whitespace-nowrap pointer-events-none">
                    <div className="text-xs font-bold flex items-center gap-1.5">
                      <span>{item.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/25 text-blue-300 font-mono">
                        {item.badge}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-300 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Operator Profile Card & Compliance Pill */}
      <div className="border-t border-slate-200/80 dark:border-slate-800/90 bg-slate-50/90 dark:bg-slate-900/60 p-3 transition-colors">
        {collapsed ? (
          <div className="flex flex-col items-center justify-center py-1.5 relative group">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                HB
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#091426]" />
            </div>

            <div className="absolute left-full bottom-2 ml-3 px-3.5 py-2.5 bg-slate-900 border border-slate-700 text-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 whitespace-nowrap pointer-events-none">
              <div className="text-xs font-bold text-white">Hoàng Hữu Bảo</div>
              <div className="text-[10px] text-blue-400 font-medium">Senior CVM Lead Analyst</div>
              <div className="mt-1 pt-1 border-t border-slate-800 text-[9px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>System Live v2.4 (Basel III)</span>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-2.5 px-1">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  HB
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#091426]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  Hoàng Hữu Bảo
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  Senior CVM Analyst &bull; Retail
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                System Live v2.4
              </span>
              <span className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[9px] font-semibold">
                Basel III
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
