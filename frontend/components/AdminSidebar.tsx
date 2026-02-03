"use client";

import Link from "next/link";
import { LayoutDashboard, CalendarDays, Settings, LogOut, UtensilsCrossed } from "lucide-react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { logoutAdmin } from "@/app/admin/actions";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/reservations", label: "Reservations", icon: CalendarDays },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-100 bg-white/80 backdrop-blur-xl shadow-sm hidden md:flex flex-col rounded-r-3xl my-4 ml-4 h-[calc(100vh-2rem)]">
      <div className="h-20 flex items-center px-8 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tight text-slate-800">
          <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <span>Bhojone<span className="text-emerald-600">.</span></span>
        </Link>
      </div>

      <div className="flex-1 py-8 px-6 space-y-2">

        <div className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider px-2">Main Menu</div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-4 px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-300",
                {
                  "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100": isActive,
                  "text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:pl-5": !isActive,
                }
              )}
            >
              <item.icon className={clsx("w-5 h-5", isActive ? "text-emerald-600" : "text-slate-400")} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-6 border-t border-slate-100">
        <form action={async () => {
          await logoutAdmin();
        }}>
          <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full group">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
