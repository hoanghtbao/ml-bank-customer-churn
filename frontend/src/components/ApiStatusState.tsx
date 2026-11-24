"use client";

import { RefreshCw, WifiOff } from "lucide-react";

interface ApiStatusStateProps {
  loading: boolean;
  error?: string | null;
  loadingText: string;
  onRetry?: () => void;
}

export default function ApiStatusState({
  loading,
  error,
  loadingText,
  onRetry,
}: ApiStatusStateProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-semibold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
          <span>{loadingText}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-80">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/70 rounded-2xl p-6 text-center shadow-xs space-y-3">
        <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
          <WifiOff className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
          Chưa kết nối được Backend FastAPI (:8000)
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {error ||
            "Máy chủ API tại http://127.0.0.1:8000 đang khởi động hoặc bị ngắt kết nối. Hãy kiểm tra terminal chạy python run_fullstack.py rồi bấm thử lại."}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Thử kết nối lại</span>
          </button>
        )}
      </div>
    </div>
  );
}
