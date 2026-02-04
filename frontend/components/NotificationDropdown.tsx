"use client";

import Link from "next/link";

import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, CalendarCheck } from "lucide-react";
import { getReservations } from "@/app/actions";
import { formatTo12Hour } from "@/utils/time";
import { motion, AnimatePresence } from "framer-motion";

interface Reservation {
    id: number;
    name: string;
    date: string;
    time: string;
    people: string;
    createdAt: Date;
}

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastReadTime, setLastReadTime] = useState<Date | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Initialize lastReadTime from localStorage
    useEffect(() => {
        const storedTime = localStorage.getItem("admin_notification_last_read");
        if (storedTime) {
            setLastReadTime(new Date(storedTime));
        }
    }, []);

    // Fetch reservations function
    const fetchReservations = async () => {
        setIsLoading(true); // Set loading true before fetch
        try {
            const data = await getReservations();
            // Take top 5 for display, but could be more
            // Assuming data.createdAt is a string that can be converted to Date
            setReservations(data.slice(0, 5).map((res: any) => ({
                ...res,
                createdAt: new Date(res.createdAt)
            })) as Reservation[]);
        } catch (error) {
            console.error("Failed to fetch reservations", error);
        } finally {
            setIsLoading(false); // Set loading false after fetch
        }
    };

    // Initial fetch and polling
    useEffect(() => {
        fetchReservations(); // Initial fetch

        // Poll every 5 seconds
        const intervalId = setInterval(fetchReservations, 5000);

        return () => clearInterval(intervalId);
    }, []);

    // Update read time when opening dropdown
    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            setLastReadTime(now);
            localStorage.setItem("admin_notification_last_read", now.toISOString());
        }
    }, [isOpen]);

    // Calculate unread count
    const unreadCount = reservations.filter(res => {
        if (!lastReadTime) return true; // All unread if never read
        return res.createdAt > lastReadTime;
    }).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-full bg-white hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors shadow-sm border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right"
                    >
                        <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-800">Notifications</h3>
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                                Recent
                            </span>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto">
                            {isLoading ? (
                                <div className="p-8 text-center text-slate-400">Loading...</div>
                            ) : reservations.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                                    <Bell className="w-8 h-8 opacity-20" />
                                    <p className="text-sm">No new reservations</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {reservations.map((res) => (
                                        <Link
                                            key={res.id}
                                            href={`/admin/reservations?date=${res.date}`}
                                            className="block p-4 hover:bg-slate-50 transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-emerald-100 rounded-full shrink-0">
                                                    <CalendarCheck className="w-4 h-4 text-emerald-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-sm font-medium text-slate-800">
                                                            {res.name}
                                                        </p>
                                                        <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                                            {formatDistanceToNow(res.createdAt, { addSuffix: true })}
                                                        </span>
                                                    </div>

                                                    <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                        <CalendarCheck className="w-3 h-3" />
                                                        <span className="text-xs font-semibold">
                                                            {res.date} • {formatTo12Hour(res.time)} • {res.people} people
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-slate-50/50 border-t border-slate-50 text-center">
                            <Link
                                href="/admin/reservations"
                                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                                onClick={() => setIsOpen(false)}
                            >
                                View All Reservations
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
