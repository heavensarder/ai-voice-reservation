'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { LayoutDashboard, CalendarDays, Settings, UtensilsCrossed } from 'lucide-react';

const navItems = [
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
                className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-md transition-colors"
                aria-label="Open Menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-50 md:hidden backdrop-blur-sm animate-in fade-in"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Sheet */}
            <div className={clsx(
                "fixed inset-y-0 left-0 z-50 w-72 bg-card shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col border-r border-border",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-border/50">
                    <Link href="/admin" className="flex items-center gap-2 font-bold text-lg tracking-tight text-primary" onClick={() => setIsOpen(false)}>
                        <div className="bg-primary/10 p-1.5 rounded-md">
                            <UtensilsCrossed className="w-5 h-5" />
                        </div>
                        <span>DineAI Admin</span>
                    </Link>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-1 text-muted-foreground hover:bg-muted rounded-md"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                    <div className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider px-2">Main Menu</div>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
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
                
                <div className="p-4 border-t border-border/50 text-xs text-center text-muted-foreground">
                    Mobile View
                </div>
            </div>
        </>
    );
}
