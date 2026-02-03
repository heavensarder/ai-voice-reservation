'use client';

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
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
    try {
        const parts = timeStr.trim().split(' ');
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
    const [date, setDate] = useState<Date | undefined>(undefined); // No date = show all
    const [allReservations, setAllReservations] = useState<any[]>([]);
    const [bookedDates, setBookedDates] = useState<Date[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<number | null>(null);
    
    // Filters
    const [timeFilter, setTimeFilter] = useState('all');
    const [guestFilter, setGuestFilter] = useState('all');

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

        // Sort by time
        return result.sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
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
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Reservations</h1>
                    <p className="text-muted-foreground mt-1">Manage and view all bookings</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="text-xs font-medium">Total Reservations</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">{totalReservations}</div>
                </div>
                <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 shadow-sm">
                    <div className="flex items-center gap-2 text-primary mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-medium">Today's Reservations</span>
                    </div>
                    <div className="text-2xl font-bold text-primary">{todayReservations.length}</div>
                </div>
                <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 shadow-sm">
                    <div className="flex items-center gap-2 text-primary mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-medium">Today's Guests</span>
                    </div>
                    <div className="text-2xl font-bold text-primary">{todayGuests}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Filters Side */}
                <Card className="lg:col-span-4 h-fit border-border/60 shadow-md">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-primary" />
                                Filters
                            </span>
                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs h-7 px-2">
                                    <RotateCcw className="w-3 h-3 mr-1" />
                                    Reset
                                </Button>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        {/* Date Filter */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-foreground">Date</label>
                                {date && (
                                    <button onClick={() => setDate(undefined)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                                        <X className="w-3 h-3" /> Clear
                                    </button>
                                )}
                            </div>
                            <div className="overflow-hidden rounded-lg border">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="w-full"
                                    modifiers={{
                                        booked: bookedDates
                                    }}
                                    modifiersClassNames={{
                                        booked: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-primary after:rounded-full after:opacity-70 font-bold"
                                    }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                <span className="w-2 h-2 bg-primary rounded-full opacity-70"></span>
                                Points = has bookings
                            </p>
                        </div>

                        {/* Time Filter */}
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Time Slot</label>
                            <div className="space-y-1">
                                {TIME_SLOTS.map(slot => (
                                    <button
                                        key={slot.value}
                                        onClick={() => setTimeFilter(slot.value)}
                                        className={clsx(
                                            "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                                            timeFilter === slot.value
                                                ? "bg-primary text-white font-medium"
                                                : "bg-muted/50 hover:bg-muted text-foreground"
                                        )}
                                    >
                                        {slot.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Guest Filter */}
                        <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Guest Count</label>
                            <div className="space-y-1">
                                {GUEST_OPTIONS.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => setGuestFilter(option.value)}
                                        className={clsx(
                                            "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                                            guestFilter === option.value
                                                ? "bg-primary text-white font-medium"
                                                : "bg-muted/50 hover:bg-muted text-foreground"
                                        )}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* List Side */}
                <Card className="lg:col-span-8 border-border/60 shadow-md min-h-[500px]">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                           <span>
                               {date ? `Bookings for ${format(date, 'MMM dd, yyyy')}` : 'All Reservations'}
                           </span>
                           <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                               {filteredReservations.length} Bookings
                           </Badge>
                        </CardTitle>
                        <CardDescription>
                            {hasActiveFilters ? 'Showing filtered results' : 'Showing all reservations'} • Click trash to delete
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-pulse">
                                <Clock className="w-10 h-10 mb-2 opacity-20" />
                                <span>Loading reservations...</span>
                            </div>
                        ) : filteredReservations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed border-border/50 rounded-xl bg-muted/5">
                                <CalendarIcon className="w-12 h-12 mb-4 opacity-10" />
                                <p className="text-lg font-medium opacity-80">No reservations found</p>
                                <p className="text-sm opacity-50">
                                    {hasActiveFilters ? 'Try adjusting your filters' : 'No bookings yet'}
                                </p>
                                {hasActiveFilters && (
                                    <Button variant="outline" size="sm" onClick={resetFilters} className="mt-4">
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Reset Filters
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {filteredReservations.map((res, idx) => (
                                    <motion.div 
                                        key={res.id || idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="flex flex-col rounded-xl border border-border/60 bg-card shadow-sm hover:shadow-md transition-all overflow-hidden group"
                                    >
                                        <div className="flex flex-row items-stretch">
                                            {/* Time Column */}
                                            <div className="bg-primary/5 border-r border-border/60 w-24 flex flex-col items-center justify-center p-3 text-center shrink-0">
                                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Time</span>
                                                <span className="text-lg font-bold text-primary font-mono leading-tight">
                                                    {res.time.split(' ')[0]}
                                                </span>
                                                <span className="text-xs font-medium text-foreground/70">
                                                    {res.time.split(' ')[1]}
                                                </span>
                                            </div>

                                            {/* Details Column */}
                                            <div className="flex-1 p-4 flex flex-col justify-center">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-semibold text-base text-foreground line-clamp-1">{res.name}</h4>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                            <Phone className="w-3 h-3" />
                                                            <span className="font-mono">{res.phone}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                                                            #{res.id}
                                                        </Badge>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleDelete(res.id)}
                                                            disabled={deleting === res.id}
                                                        >
                                                            <Trash2 className={clsx("w-4 h-4", deleting === res.id && "animate-pulse")} />
                                                        </Button>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between text-sm mt-1">
                                                     <div className="flex items-center gap-1.5 text-foreground/80 bg-secondary/50 px-2 py-1 rounded-md text-xs">
                                                        <Users className="w-3.5 h-3.5" />
                                                        <span className="font-medium">{res.people} Guests</span>
                                                     </div>
                                                     <div className="text-xs font-medium text-muted-foreground">
                                                        {formatDisplayDate(res.date)}
                                                     </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
