"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSidebar, useTheme } from "./AppShell";
import { fetchApi } from "@/lib/api";
import { formatInt } from "@/lib/formatters";
import {
  PanelLeftClose,
  PanelLeft,
  Search,
  Cpu,
  Clock,
  Sun,
  Moon,
  X,
  ArrowUpRight,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const ROUTE_TITLES: Record<string, { title: string; section: string }> = {
  "/": { title: "Tổng Quan Hồ Sơ & Kiến Trúc", section: "BB Bank" },
  "/dashboard": { title: "Báo Cáo Điều Hành Danh Mục", section: "Descriptive & Diagnostic" },
  "/advisor": { title: "Tư Vấn Giữ Chân 1-1 (SLA 4h)", section: "Predictive & Prescriptive" },
  "/batch": { title: "Chấm Điểm Danh Mục Khách Hàng", section: "Campaign Operations" },
  "/strategy": { title: "Chiến Lược 4 Quadrants & Tiered ROI", section: "Financial Planning" },
  "/governance": { title: "Quản Trị Mô Hình & SHAP", section: "Risk & AI Ethics" },
};

interface SearchCustomerHit {
  CustomerId: number;
  Surname: string;
  Geography: string;
  Age: number;
  Balance: number;
  Complain: number;
}

export default function TopNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, toggleSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const currentRoute = ROUTE_TITLES[pathname] || { title: "Phân Hệ Nghiệp Vụ", section: "BB Bank" };

  const [timeStr, setTimeStr] = useState("");
  const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchCustomerHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Live Frankfurt CET/CEST Clock
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

  // Real FastAPI /api/health Monitor
  useEffect(() => {
    let active = true;
    const checkHealth = () => {
      fetchApi("/api/health")
        .then((res) => {
          if (active) setApiStatus(res?.status === "healthy" ? "online" : "offline");
        })
        .catch(() => {
          if (active) setApiStatus("offline");
        });
    };
    checkHealth();
    const timer = setInterval(checkHealth, 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  // Global Ctrl+K shortcut & click-outside close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        setDropdownOpen(true);
      } else if (e.key === "Escape") {
        setDropdownOpen(false);
        searchInputRef.current?.blur();
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced Customer Search across 10.000 profiles
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(() => {
      setSearching(true);
      fetchApi(`/api/batch/search?q=${encodeURIComponent(q)}&limit=7`)
        .then((res) => {
          if (!cancelled) {
            setSearchResults(res?.results || []);
            setSearching(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setSearchResults([]);
            setSearching(false);
          }
        });
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [searchQuery]);

  const handleSelectCustomer = (customerId: number) => {
    setDropdownOpen(false);
    setSearchQuery("");
    if (pathname === "/advisor") {
      window.dispatchEvent(new CustomEvent("bb-select-customer", { detail: { customerId } }));
      window.history.replaceState(null, "", `/advisor?customerId=${customerId}`);
    } else {
      router.push(`/advisor?customerId=${customerId}`);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    if (searchResults.length === 1) {
      handleSelectCustomer(searchResults[0].CustomerId);
      return;
    }
    setDropdownOpen(false);
    if (pathname === "/batch") {
      window.dispatchEvent(new CustomEvent("bb-batch-search", { detail: { query: q } }));
      window.history.replaceState(null, "", `/batch?q=${encodeURIComponent(q)}`);
    } else {
      router.push(`/batch?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 lg:px-6 flex items-center justify-between gap-3 transition-colors duration-200">
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

        <div className="hidden sm:flex items-center gap-1.5 text-xs min-w-0">
          <span className="text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
            {currentRoute.section}
          </span>
          <span className="text-slate-400 dark:text-slate-600 shrink-0">/</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
            {currentRoute.title}
          </span>
        </div>
      </div>

      {/* Center: Live Customer Quick Search (Ctrl+K) */}
      <div ref={searchBoxRef} className="hidden lg:flex items-center flex-1 max-w-xs xl:max-w-sm mx-2 relative">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onFocus={() => setDropdownOpen(true)}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              setDropdownOpen(true);
              if (!val.trim()) {
                setSearchResults([]);
                setSearching(false);
              }
            }}
            aria-label="Tìm kiếm nhanh khách hàng theo ID hoặc Họ"
            placeholder="Tìm KH theo ID, Họ..."
            className="w-full pl-9 pr-16 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                searchInputRef.current?.focus();
              }}
              aria-label="Xóa từ khóa tìm kiếm"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border border-slate-300/60 dark:border-slate-700 pointer-events-none">
              Ctrl+K
            </kbd>
          )}
        </form>

        {/* Live Search Results Dropdown */}
        {dropdownOpen && searchQuery.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span>{searching ? "Đang tìm trong 10.000 KH..." : "Kết quả tra cứu nhanh"}</span>
              <span>Enter &rarr; Lưới Excel</span>
            </div>

            {searchResults.length === 0 && !searching ? (
              <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                Không tìm thấy khách hàng khớp &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                {searchResults.map((hit) => (
                  <li key={hit.CustomerId}>
                    <button
                      type="button"
                      onClick={() => handleSelectCustomer(hit.CustomerId)}
                      className="w-full px-3 py-2.5 text-left hover:bg-blue-50/80 dark:hover:bg-slate-800 flex items-center justify-between gap-2 transition-colors cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span className="truncate">{hit.Surname}</span>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            #{hit.CustomerId}
                          </span>
                          {hit.Complain === 1 && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                              SLA 4h
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-0.5">
                          {hit.Geography} &bull; {hit.Age} tuổi &bull; Số dư: {formatInt(hit.Balance)} &euro;
                        </div>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Right: Operational Badges, Light/Dark Toggle & Profile */}
      <div className="flex items-center gap-2 lg:gap-2.5 shrink-0">
        {/* Market Time */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Frankfurt:</span>
          <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {timeStr || "13:00:00 CET"}
          </span>
        </div>

        {/* AI Champion Pill */}
        <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[11px] font-semibold text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 whitespace-nowrap">
          <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>XGBoost</span>
          <span className="px-1.5 py-0.2 rounded bg-blue-200/70 dark:bg-blue-900 text-blue-900 dark:text-blue-200 text-[10px] font-bold">
            T* 0,45
          </span>
        </div>

        {/* Live FastAPI Health Badge */}
        <div
          title={
            apiStatus === "online"
              ? "FastAPI Backend đang hoạt động bình thường (/api/health)"
              : apiStatus === "offline"
              ? "Không thể kết nối tới FastAPI Backend (http://127.0.0.1:8000)"
              : "Đang kiểm tra kết nối FastAPI Backend..."
          }
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap transition-colors ${
            apiStatus === "online"
              ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80"
              : apiStatus === "offline"
              ? "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80"
              : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80"
          }`}
        >
          <span className="relative flex h-2 w-2">
            {apiStatus === "online" && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                apiStatus === "online"
                  ? "bg-emerald-500"
                  : apiStatus === "offline"
                  ? "bg-rose-500"
                  : "bg-amber-500"
              }`}
            />
          </span>
          <span>
            {apiStatus === "online" ? "FastAPI Live" : apiStatus === "offline" ? "API Offline" : "Connecting"}
          </span>
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
