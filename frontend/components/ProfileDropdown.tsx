"use client";

import { useState, useEffect, useRef } from "react";
import { User, LogOut, Settings, Mail } from "lucide-react";
import { getAdminProfile, logoutAdmin } from "@/app/admin/actions";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface AdminProfile {
    email: string;
    id?: number;
}

export default function ProfileDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [profile, setProfile] = useState<AdminProfile | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && !profile) {
            getAdminProfile().then((data) => {
                if (data) {
                    setProfile(data as AdminProfile);
                }
            });
        }
    }, [isOpen, profile]);

    const handleLogout = async () => {
        await logoutAdmin();
        router.push("/admin/login");
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-white shadow-sm hover:ring-2 hover:ring-emerald-500/20 transition-all cursor-pointer outline-none"
            >
                <User className="w-5 h-5 text-emerald-600" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right"
                    >
                        <div className="p-4 bg-slate-50/50 border-b border-slate-50">
                            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Signed in as</p>
                            <p className="text-sm font-medium text-slate-800 truncate" title={profile?.email || 'Loading...'}>
                                {profile?.email || 'Loading...'}
                            </p>
                        </div>

                        <div className="p-2">
                            <button
                                className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-3"
                                onClick={() => router.push('/admin/settings')}
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                            </button>
                            <button
                                className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-3"
                                onClick={() => router.push('/admin/dashboard')}
                            >
                                <Mail className="w-4 h-4" />
                                Dashboard
                            </button>
                        </div>

                        <div className="p-2 border-t border-slate-50">
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-3"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
