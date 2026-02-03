"use client";

import Link from "next/link";
import { LayoutDashboard, CalendarDays, Settings, LogOut, UtensilsCrossed, Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
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
    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-card shadow-sm hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-border/50">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-lg tracking-tight text-primary">
          <div className="bg-primary/10 p-1.5 rounded-md">
             <UtensilsCrossed className="w-5 h-5" />
          </div>
          <span>DineAI Admin</span>
        </Link>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1">
        
        <div className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider px-2">Main Menu</div>
        
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all",
                {
                  "bg-primary/10 text-primary": isActive,
                  "text-muted-foreground hover:bg-muted hover:text-foreground": !isActive,
                }
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </div>



      <div className="p-4 border-t border-border/50">
         <form action={async () => {
             await logoutAdmin();
             // The action likely handles redirect, or we can force it here just in case if client-side nav is needed
             // But server action redirect is best.
         }}>
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full">
                <LogOut className="w-4 h-4" />
                Logout
            </button>
         </form>
      </div>
    </aside>
  );
}
