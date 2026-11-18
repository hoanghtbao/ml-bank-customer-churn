import React from "react";
import { ShieldCheck, Sparkles } from "lucide-react";

interface PageHeaderProps {
  category: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

export default function PageHeader({ category, title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 mb-7 shadow-xs hover:shadow-sm transition-shadow">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-gradient-to-br from-blue-100/40 via-indigo-100/20 to-transparent rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-200/70 px-2.5 py-0.5 rounded-md">
              {category}
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              &bull; Thị trường trọng điểm: 🇫🇷 Pháp &bull; 🇩🇪 Đức &bull; 🇪🇸 Tây Ban Nha
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        {action ? (
          <div className="flex items-center gap-3 flex-shrink-0">{action}</div>
        ) : (
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></span>
              <span>FastAPI REST &bull; 2.4.0</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Basel III Certified</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
