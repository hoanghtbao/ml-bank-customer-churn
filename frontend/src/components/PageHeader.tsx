interface PageHeaderProps {
  category: string;
  title: string;
  subtitle: string;
}

export default function PageHeader({ category, title, subtitle }: PageHeaderProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
          {category}
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500"></span>
          <span>FastAPI Connected</span>
        </div>
      </div>
    </div>
  );
}
