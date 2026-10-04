"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Video,
  BarChart3,
  Search,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  User,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export const DashboardNav: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");
  const { officer, signOut } = useAuth();
  const officerEmail = officer?.email ?? "officer@traffic.gov.in";

  const handleSignOut = async () => {
    await signOut();
    router.push("/?loggedout=true");
  };

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      router.push(`/dashboard/map?plate=${encodeURIComponent(quickSearch.trim().toUpperCase())}`);
    }
  };

  const primaryNavItems = [
    {
      label: "Dashboard",
      subLabel: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Dispatch Map",
      subLabel: "GIS Live",
      href: "/dashboard/map",
      icon: MapPin,
      exact: false,
    },
    {
      label: "Video Review",
      subLabel: "Studio",
      href: "/dashboard/search",
      icon: Video,
      exact: false,
    },
    {
      label: "Statistics",
      subLabel: "Database",
      href: "/dashboard/database",
      icon: BarChart3,
      exact: false,
    },
    {
      label: "Advanced Search",
      subLabel: "Query",
      href: "/dashboard/search",
      icon: Search,
      exact: false,
    },
    {
      label: "CarCheck",
      subLabel: "Hotlist",
      href: "/dashboard/blacklist",
      icon: ShieldAlert,
      exact: false,
      badge: "2",
      badgeColor: "bg-rose-500",
    },
  ];

  const isItemActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          1. REKOR SCOUT LEFT VERTICAL NAVIGATION RAIL (Desktop)
          Matches Image 1, 2, 3, 4 with dark navy canvas (#0E1321)
          ══════════════════════════════════════════════════════════════ */}
      <aside
        className="fixed top-0 bottom-0 left-0 w-20 bg-[#0E1321] text-slate-300 z-50 flex flex-col justify-between items-center py-3 border-r border-slate-800/80 shadow-2xl hidden md:flex select-none"
        aria-label="Rekor Scout Sidebar Navigation"
      >
        {/* Top: Rekor / VisionX Insignia */}
        <div className="flex flex-col items-center gap-3 w-full px-2">
          <Link
            href="/dashboard"
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center text-white font-mono font-black text-xl shadow-lg shadow-blue-900/40 hover:scale-105 transition-transform"
            title="VisionX Surveillance Intelligence"
          >
            <span className="tracking-tighter">VX</span>
          </Link>
          <div className="w-8 h-px bg-slate-800" />
        </div>

        {/* Center: Main Navigation Rail Stack */}
        <nav className="flex flex-col items-center gap-1.5 w-full px-1.5 overflow-y-auto overflow-x-hidden py-1">
          {primaryNavItems.map((item, idx) => {
            const active = isItemActive(item.href, item.exact);
            const Icon = item.icon;

            return (
              <Link
                key={`${item.href}-${idx}`}
                href={item.href}
                className={`relative group w-full py-2.5 px-1 rounded-sm flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  active
                    ? "bg-white/10 text-white font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
                title={item.label}
              >
                {/* Active Indicator Bar on Left */}
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-white shadow-sm" />
                )}

                <div className="relative">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                      active ? "text-white" : "text-slate-400 group-hover:text-white"
                    }`}
                  />
                  {item.badge && (
                    <span
                      className={`absolute -top-1.5 -right-2 px-1 py-0.2 rounded-xs text-[9px] font-mono font-bold text-white ${item.badgeColor} animate-pulse`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                <span
                  className={`text-[9.5px] leading-tight text-center tracking-tight transition-colors ${
                    active ? "text-white font-semibold" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: Utilities & Configuration */}
        <div className="flex flex-col items-center gap-2 w-full px-2 pt-2 border-t border-slate-800/80">
          <Link
            href="/"
            className="w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-white/6 flex items-center justify-center transition-all"
            title="Public Mobility Landing Site"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>

          <button
            onClick={handleSignOut}
            className="w-10 h-10 rounded-xl text-rose-400 hover:text-rose-200 hover:bg-rose-500/10 flex items-center justify-center transition-all cursor-pointer"
            title="Lock Console / Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════
          2. REKOR SCOUT TOP UTILITY HEADER BAR
          Quick Search & System Status
          ══════════════════════════════════════════════════════════════ */}
      <header
        className="fixed top-0 right-0 left-0 md:left-20 h-14 bg-white/95 backdrop-blur-xl border-b border-black/10 z-40 px-4 sm:px-6 flex items-center justify-between shadow-xs select-none"
        aria-label="Rekor Scout Top Header"
      >
        {/* Left Side: Mobile Menu Button & Rekor Quick Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-black/10 text-black hover:bg-black/5 cursor-pointer"
            aria-label="Toggle Navigation Drawer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Quick Search Form (Rekor Scout Image 3 Specification) */}
          <form
            onSubmit={handleQuickSearchSubmit}
            className="relative flex-1 max-w-md hidden sm:flex items-center"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Quick Plate Search... (e.g. KA05MR9633)"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full pl-9 pr-14 py-1.5 rounded-xs border border-black/20 bg-slate-50/70 hover:bg-white focus:bg-white text-xs font-mono text-black placeholder:text-slate-400 focus:outline-none focus:border-black transition-all"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-xs bg-black hover:bg-neutral-800 text-white text-[10px] font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer"
              >
                Go
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Telemetry & Officer Avatar */}
        <div className="flex items-center gap-3">
          {/* Engine Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-black text-[10px] font-mono uppercase tracking-wider text-white border border-black">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">CUDA Active</span>
          </div>

          {/* Officer Identity & Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-black/10">
            <div className="hidden xl:flex flex-col text-right">
              <span className="text-xs font-semibold text-black leading-tight truncate max-w-[130px]">
                {officerEmail.split("@")[0]}
              </span>
              <span className="text-[10px] font-mono uppercase text-slate-500">Operator</span>
            </div>

            <div
              className="w-8 h-8 rounded-xs bg-black text-white flex items-center justify-center font-bold text-xs border border-black"
              title={officerEmail}
            >
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          3. MOBILE NAVIGATION DRAWER
          Responsive overlay for small screens
          ══════════════════════════════════════════════════════════════ */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[100] md:hidden bg-black/60 backdrop-blur-xs flex"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 bg-[#0E1321] text-white h-full flex flex-col justify-between p-6 shadow-2xl border-r border-slate-800 animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-base">
                    VX
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">VisionX Scout</div>
                    <div className="text-[11px] font-mono text-slate-400">Public Safety LPR</div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Links */}
              <nav className="mt-6 space-y-1">
                {primaryNavItems.map((item, idx) => {
                  const active = isItemActive(item.href, item.exact);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={`mob-${item.href}-${idx}`}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-blue-600 text-white font-semibold shadow-xs"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-6 border-t border-slate-800 space-y-3">
              <div className="text-xs text-slate-400 font-mono truncate">{officerEmail}</div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out / Lock Portal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardNav;

