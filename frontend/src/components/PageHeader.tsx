import React from "react";
import { ShieldCheck } from "lucide-react";

interface PageHeaderProps {
  category: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

export default function PageHeader({ category, title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-7 mb-6 shadow-xs transition-colors duration-200">
      {/* Subtle background ambient accent */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-gradient-to-br from-blue-100/50 via-indigo-100/20 to-transparent dark:from-blue-600/10 dark:via-indigo-600/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800/80 px-2.5 py-0.5 rounded-md">
              {category}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              &bull; Thị trường trọng điểm: Pháp (FR) &bull; Đức (DE) &bull; Tây Ban Nha (ES)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        </div>

        {action ? (
          <div className="flex items-center gap-3 shrink-0">{action}</div>
        ) : (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900" />
              <span>FastAPI REST &bull; 2.4.0</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-xs font-semibold text-blue-700 dark:text-blue-300">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Basel III Certified</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
