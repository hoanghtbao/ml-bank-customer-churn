"use client";

import { useState, useEffect } from "react";
import type { ChartFigureItem } from "@/lib/chartCatalog";
import { Maximize2, X, ChevronLeft, ChevronRight, Lightbulb, BarChart3 } from "lucide-react";

interface FigureGalleryProps {
  figures: ChartFigureItem[];
  columns?: 2 | 3;
  enableFilter?: boolean;
}

const FILTER_TABS = [
  { id: "ALL", label: "Tất cả" },
  { id: "univariate", label: "Đơn biến" },
  { id: "bivariate", label: "Nhị biến & WOE/IV" },
  { id: "multivariate", label: "Đa biến & Rò rỉ" },
] as const;

export default function FigureGallery({
  figures,
  columns = 3,
  enableFilter = false,
}: FigureGalleryProps) {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const visibleFigures =
    !enableFilter || activeFilter === "ALL"
      ? figures
      : figures.filter((f) => f.category === activeFilter);

  const activeFigure =
    lightboxIndex !== null && visibleFigures[lightboxIndex]
      ? visibleFigures[lightboxIndex]
      : null;

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % visibleFigures.length
        );
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + visibleFigures.length) % visibleFigures.length
        );
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, visibleFigures.length]);

  const gridColsClass =
    columns === 2
      ? "grid-cols-1 lg:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";

  return (
    <div className="space-y-5">
      {/* Filter Pills Bar (for 13-chart EDA Gallery) */}
      {enableFilter && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {FILTER_TABS.map((tab) => {
              const count =
                tab.id === "ALL"
                  ? figures.length
                  : figures.filter((f) => f.category === tab.id).length;
              const isSelected = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveFilter(tab.id);
                    setLightboxIndex(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Nhấp vào biểu đồ bất kỳ để phóng to toàn màn hình khi thuyết trình
          </div>
        </div>
      )}

      {/* Figures Card Grid */}
      <div className={`grid ${gridColsClass} gap-5`}>
        {visibleFigures.map((fig, idx) => (
          <article
            key={fig.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top Badges */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold shrink-0">
                    {fig.code}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                    {fig.categoryLabel}
                  </span>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-bold whitespace-nowrap shrink-0">
                  {fig.keyStat}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug mb-3">
                {fig.title}
              </h3>

              {/* Chart Image Thumbnail */}
              <button
                type="button"
                onClick={() => setLightboxIndex(idx)}
                aria-label={`Phóng to ${fig.title}`}
                className="group relative w-full bg-white rounded-xl border border-slate-200 overflow-hidden p-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <img
                  src={fig.src}
                  alt={fig.title}
                  loading="lazy"
                  className="w-full h-48 object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                />
                <span className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-slate-900/80 text-white text-[10px] font-semibold inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3 h-3" />
                  <span>Phóng to</span>
                </span>
              </button>
            </div>

            {/* Structured Talking Points for Defense */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs leading-relaxed">
              <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                <BarChart3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-100">Vẽ gì: </span>
                  {fig.whatItShows}
                </div>
              </div>
              <div className="flex items-start gap-2 text-slate-700 dark:text-slate-200 bg-blue-50/70 dark:bg-blue-950/30 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/50">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-blue-800 dark:text-blue-300">Ý nghĩa BB Bank: </span>
                  {fig.businessMeaning}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {activeFigure && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeFigure.title}
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-6"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono text-[10px] font-bold">
                    {activeFigure.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {activeFigure.categoryLabel}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-mono text-[11px] font-bold">
                    {activeFigure.keyStat}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {activeFigure.title}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((prev) =>
                      prev === null
                        ? 0
                        : (prev - 1 + visibleFigures.length) % visibleFigures.length
                    )
                  }
                  aria-label="Biểu đồ trước"
                  title="Biểu đồ trước (Mũi tên trái)"
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((prev) =>
                      prev === null ? 0 : (prev + 1) % visibleFigures.length
                    )
                  }
                  aria-label="Biểu đồ tiếp theo"
                  title="Biểu đồ tiếp theo (Mũi tên phải)"
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  aria-label="Đóng xem ảnh lớn"
                  title="Đóng (Esc)"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950 dark:hover:text-rose-300 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Enlarged Figure */}
            <div className="my-4 bg-white rounded-2xl border border-slate-200 p-3 flex items-center justify-center">
              <img
                src={activeFigure.src}
                alt={activeFigure.title}
                className="max-h-[58vh] w-auto object-contain"
              />
            </div>

            {/* Detailed Explanation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Cách đọc &amp; Biểu đồ thể hiện điều gì?</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">{activeFigure.whatItShows}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <div className="font-bold text-blue-900 dark:text-blue-200 mb-1 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Ý nghĩa Quyết định cho BB Bank</span>
                </div>
                <p className="text-slate-700 dark:text-slate-200">{activeFigure.businessMeaning}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
