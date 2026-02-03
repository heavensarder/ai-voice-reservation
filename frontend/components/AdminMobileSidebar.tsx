'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { LayoutDashboard, CalendarDays, Settings, UtensilsCrossed } from 'lucide-react';

const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/reservations", label: "Reservations", icon: CalendarDays },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminMobileSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Open Menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 z-50 md:hidden backdrop-blur-sm animate-in fade-in"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Sheet */}
            <div className={clsx(
                "fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-24 flex items-center justify-between px-6 border-b border-slate-100">
                    <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tight text-slate-800" onClick={() => setIsOpen(false)}>
                        <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl">
                            <UtensilsCrossed className="w-6 h-6" />
                        </div>
                        <span>Bhojone<span className="text-emerald-600">.</span></span>
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-xl transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 py-8 px-6 space-y-2 overflow-y-auto">
                    <div className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider px-2">Main Menu</div>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
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

                <div className="p-6 border-t border-slate-100 text-xs text-center text-slate-400 font-medium">
                    Bhojone Restaurant Admin
                </div>
            </div>
        </>
    );
}
