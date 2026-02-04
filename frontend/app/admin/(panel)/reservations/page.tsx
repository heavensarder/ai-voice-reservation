'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { format, parse } from 'date-fns';
import { formatTo12Hour } from '@/utils/time';
import { Calendar as CalendarIcon, Users, Clock, Phone, Trash2, Filter, X, RotateCcw } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getReservations, getAllBookedDates, deleteReservation } from '@/app/actions';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

// Helper to parse time for sorting (converts "HH:MM AM/PM" to minutes from midnight)
function parseTimeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;

    // Normalize to 12-hour format first (e.g., "02:30 PM")
    const standardTime = formatTo12Hour(timeStr);

    try {
        const parts = standardTime.trim().split(' ');
        if (parts.length < 2) return 0;

        const [hours, minutes] = parts[0].split(':').map(Number);
        const isPM = parts[1]?.toUpperCase() === 'PM';
        let totalHours = hours;

        if (isPM && hours !== 12) totalHours += 12;
        if (!isPM && hours === 12) totalHours = 0;

        return totalHours * 60 + (minutes || 0);
    } catch {
        return 0;
    }
}

// Helper to format date from DD-MM-YYYY to "25 Feb 2026"
function formatDisplayDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const [day, month, year] = parts.map(Number);
            const date = new Date(year, month - 1, day);
            return format(date, 'dd MMM yyyy');
        }
        return dateStr;
    } catch {
        return dateStr;
    }
}

// Time slots for filter
const TIME_SLOTS = [
    { label: 'All Times', value: 'all' },
    { label: 'Morning (6AM-12PM)', value: 'morning', min: 360, max: 720 },
    { label: 'Afternoon (12PM-5PM)', value: 'afternoon', min: 720, max: 1020 },
    { label: 'Evening (5PM-9PM)', value: 'evening', min: 1020, max: 1260 },
    { label: 'Night (9PM-12AM)', value: 'night', min: 1260, max: 1440 },
];

// Guest count options
const GUEST_OPTIONS = [
    { label: 'All Guests', value: 'all' },
    { label: '1-2 Guests', value: '1-2', min: 1, max: 2 },
    { label: '3-4 Guests', value: '3-4', min: 3, max: 4 },
    { label: '5-6 Guests', value: '5-6', min: 5, max: 6 },
    { label: '7+ Guests', value: '7+', min: 7, max: 100 },
];

export default function ReservationsPage() {
    return (
        <Suspense fallback={
            <div className="h-full flex flex-col items-center justify-center text-slate-400 animate-pulse">
                <Clock className="w-12 h-12 mb-4 opacity-20" />
                <span className="font-medium">Loading...</span>
            </div>
        }>
            <ReservationsContent />
        </Suspense>
    );
}

function ReservationsContent() {
    const searchParams = useSearchParams();
    const [date, setDate] = useState<Date | undefined>(undefined); // No date = show all
    const [allReservations, setAllReservations] = useState<any[]>([]);
    const [bookedDates, setBookedDates] = useState<Date[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<number | null>(null);

    // Filters
    const [timeFilter, setTimeFilter] = useState('all');
    const [guestFilter, setGuestFilter] = useState('all');

    // Initialize date from URL param
    useEffect(() => {
        const dateParam = searchParams.get('date');
        if (dateParam) {
            try {
                // Parse "DD-MM-YYYY"
                const parsedDate = parse(dateParam, 'dd-MM-yyyy', new Date());
                if (!isNaN(parsedDate.getTime())) {
                    setDate(parsedDate);
                }
            } catch (e) {
                console.error("Invalid date param:", dateParam);
            }
        }
    }, [searchParams]);

    // Fetch ALL reservations
    useEffect(() => {
        async function fetchAllReservations() {
            setLoading(true);
            try {
                const data = await getReservations();
                setAllReservations(data);
            } catch (e) {
                console.error("Failed to fetch all reservations", e);
            } finally {
                setLoading(false);
            }
        }
        fetchAllReservations();
    }, []);

    // Refresh after delete
    const refreshData = async () => {
        try {
            const data = await getReservations();
            setAllReservations(data);
        } catch (e) {
            console.error("Failed to refresh", e);
        }
    };

    // Fetch all booked dates for the calendar markers
    useEffect(() => {
        async function fetchBookedDates() {
            try {
                const datesStr = await getAllBookedDates();
                const dates = datesStr.map(d => {
                    const parts = d.split('-');
                    if (parts.length === 3) {
                        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                    }
                    return null;
                }).filter(Boolean) as Date[];
                setBookedDates(dates);
            } catch (e) {
                console.error("Failed to fetch booked dates", e);
            }
        }
        fetchBookedDates();
    }, [allReservations]);

    // Apply filters
    const filteredReservations = useMemo(() => {
        let result = [...allReservations];

        // Date filter
        if (date) {
            const dateStr = format(date, 'dd-MM-yyyy');
            result = result.filter(r => r.date === dateStr);
        }

        // Time filter
        if (timeFilter !== 'all') {
            const slot = TIME_SLOTS.find(s => s.value === timeFilter);
            if (slot && slot.min !== undefined && slot.max !== undefined) {
                result = result.filter(r => {
                    const mins = parseTimeToMinutes(r.time);
                    return mins >= slot.min! && mins < slot.max!;
                });
            }
        }

        // Guest filter
        if (guestFilter !== 'all') {
            const option = GUEST_OPTIONS.find(o => o.value === guestFilter);
            if (option && option.min !== undefined && option.max !== undefined) {
                result = result.filter(r => {
                    const guests = parseInt(r.people) || 0;
                    return guests >= option.min! && guests <= option.max!;
                });
            }
        }

        // Sort by time only if a specific date is filtered
        if (date) {
            return result.sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
        }

        // Otherwise return as is (default is createdAt desc from server)
        return result;
    }, [allReservations, date, timeFilter, guestFilter]);

    // Calculate totals
    const totalReservations = allReservations.length;

    // Calculate today's stats
    const today = new Date();
    const todayStr = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    const todayReservations = allReservations.filter(r => r.date === todayStr);
    const todayGuests = todayReservations.reduce((sum, r) => sum + (parseInt(r.people) || 0), 0);

    // Reset filters
    const resetFilters = () => {
        setDate(undefined);
        setTimeFilter('all');
        setGuestFilter('all');
    };

    const hasActiveFilters = date || timeFilter !== 'all' || guestFilter !== 'all';

    // Delete handler
    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this reservation?')) return;

        setDeleting(id);
        try {
            const result = await deleteReservation(id);
            if (result.success) {
                refreshData();
            } else {
                alert('Failed to delete reservation');
            }
        } catch (e) {
            alert('Error deleting reservation');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reservations</h1>
                    <p className="text-slate-500 mt-1">Manage and view all bookings</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                        <CalendarIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Bookings</p>
                        <p className="text-2xl font-bold text-slate-900">{totalReservations}</p>
                    </div>
                </div>
                <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Bookings</p>
                        <p className="text-2xl font-bold text-emerald-600">{todayReservations.length}</p>
                    </div>
                </div>
                <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Guests</p>
                        <p className="text-2xl font-bold text-emerald-600">{todayGuests}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Filters Side */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Filter className="w-5 h-5 text-emerald-500" />
                                Filters
                            </h3>
                            {hasActiveFilters && (
                                <button onClick={resetFilters} className="text-xs font-bold text-slate-400 hover:text-emerald-600 flex items-center gap-1 transition-colors">
                                    <RotateCcw className="w-3 h-3" /> Reset
                                </button>
                            )}
                        </div>

                        {/* Date Filter */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-bold text-slate-600">Date</label>
                                {date && (
                                    <button onClick={() => setDate(undefined)} className="text-xs font-bold text-red-400 hover:text-red-500 flex items-center gap-1">
                                        <X className="w-3 h-3" /> Clear
                                    </button>
                                )}
                            </div>
                            <div className="border border-slate-100 rounded-2xl overflow-hidden">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="w-full bg-white"
                                    modifiers={{ booked: bookedDates }}
                                    modifiersClassNames={{
                                        booked: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-emerald-500 after:rounded-full font-bold text-slate-900"
                                    }}
                                />
                            </div>
                        </div>

                        {/* Filters Group */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Time Slot</label>
                                <div className="space-y-1">
                                    {TIME_SLOTS.map(slot => (
                                        <button
                                            key={slot.value}
                                            onClick={() => setTimeFilter(slot.value)}
                                            className={clsx(
                                                "w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                                timeFilter === slot.value
                                                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                                                    : "text-slate-600 hover:bg-slate-50"
                                            )}
                                        >
                                            {slot.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Guest Count</label>
                                <div className="space-y-1">
                                    {GUEST_OPTIONS.map(option => (
                                        <button
                                            key={option.value}
                                            onClick={() => setGuestFilter(option.value)}
                                            className={clsx(
                                                "w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                                guestFilter === option.value
                                                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                                                    : "text-slate-600 hover:bg-slate-50"
                                            )}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* List Side */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    {date ? `Bookings for ${format(date, 'MMM dd, yyyy')}` : 'All Reservations'}
                                </h2>
                                <p className="text-sm text-slate-400 font-medium mt-0.5">
                                    {filteredReservations.length} reservations found
                                </p>
                            </div>
                        </div>

                        <div className="p-6 flex-1 bg-slate-50/30">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 animate-pulse">
                                    <Clock className="w-12 h-12 mb-4 opacity-20" />
                                    <span className="font-medium">Loading reservations...</span>
                                </div>
                            ) : filteredReservations.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                                        <CalendarIcon className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <p className="text-lg font-bold text-slate-600">No reservations found</p>
                                    <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2">
                                        {hasActiveFilters ? 'Try adjusting your filters to see more results.' : 'You have no bookings for this criteria yet.'}
                                    </p>
                                    {hasActiveFilters && (
                                        <button onClick={resetFilters} className="mt-6 px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-xl text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors">
                                            Clear Filters
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredReservations.map((res, idx) => (
                                        <motion.div
                                            key={res.id || idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/20 transition-all duration-300 overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-100 group-hover:bg-emerald-500 transition-colors" />
                                            <div className="p-5 pl-7">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-3xl font-bold text-slate-800 tracking-tight group-hover:text-emerald-600 transition-colors">
                                                            {(() => {
                                                                const formatted = formatTo12Hour(res.time);
                                                                const [time, period] = formatted.split(' ');
                                                                return (
                                                                    <>
                                                                        {time}
                                                                        <span className="text-base text-slate-400 ml-1 decoration-0 align-top mt-1 inline-block">{period}</span>
                                                                    </>
                                                                );
                                                            })()}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{formatDisplayDate(res.date)}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(res.id)}
                                                        disabled={deleting === res.id}
                                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                    >
                                                        <Trash2 className={clsx("w-5 h-5", deleting === res.id && "animate-pulse")} />
                                                    </button>
                                                </div>

                                                <div className="space-y-3 pt-3 border-t border-slate-50">
                                                    <div>
                                                        <h4 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors font-bangla">{res.name}</h4>
                                                        <div className="flex items-center gap-2 text-sm text-slate-500 font-mono mt-0.5">
                                                            <Phone className="w-3.5 h-3.5" />
                                                            {res.phone}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <div className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                                                            <Users className="w-3.5 h-3.5" />
                                                            {res.people} Guests
                                                        </div>
                                                        <div className="inline-flex items-center gap-1.5 bg-slate-50 text-slate-400 px-3 py-1.5 rounded-lg text-xs font-bold">
                                                            ID: #{res.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
