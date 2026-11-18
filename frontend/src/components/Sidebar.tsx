"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Landmark,
  LayoutDashboard,
  UserCheck,
  FileSpreadsheet,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const NAV_ITEMS = [
  {
    name: "Tổng Quan Ngân Hàng",
    href: "/",
    icon: Landmark,
    description: "Hồ sơ & Kiến trúc 4 tầng",
  },
  {
    name: "Báo Cáo Điều Hành",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Dual Baseline & Tâm chấn Đức",
  },
  {
    name: "Tư Vấn Giữ Chân 1-1",
    href: "/advisor",
    icon: UserCheck,
    description: "Chấm điểm, What-If & Kịch bản RM",
  },
  {
    name: "Chấm Điểm Hàng Loạt",
    href: "/batch",
    icon: FileSpreadsheet,
    description: "Lọc rủi ro & Xuất Call-list",
  },
  {
    name: "Chiến Lược & Tiered ROI",
    href: "/strategy",
    icon: TrendingUp,
    description: "4 Quadrants & Máy tính ROI",
  },
  {
    name: "Quản Trị Mô Hình (SHAP)",
    href: "/governance",
    icon: ShieldCheck,
    description: "Decile Lift, Ablation & Đạo đức AI",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#091426] text-slate-200 border-r border-slate-800/80 flex flex-col justify-between z-50">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-white leading-tight">
                EUROVANGUARD
              </div>
              <div className="text-[10px] font-semibold text-blue-400 tracking-wider uppercase">
                Bank Decision Support
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Phân Hệ Nghiệp Vụ
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <div>
                  <div>{item.name}</div>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Operator Profile Card & System Status */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-bold text-xs text-white">
            HB
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white truncate">Hoàng Hữu Bảo</div>
            <div className="text-[11px] text-slate-400 truncate">Senior CVM Analyst</div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            System Live v2.4
          </span>
          <span className="text-slate-500 font-mono">Basel III</span>
        </div>
      </div>
    </aside>
  );
}
