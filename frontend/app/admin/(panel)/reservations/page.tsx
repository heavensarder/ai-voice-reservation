'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Users, Clock, Phone, Trash2 } from 'lucide-react';
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

export default function ReservationsPage() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [reservations, setReservations] = useState<any[]>([]);
    const [bookedDates, setBookedDates] = useState<Date[]>([]);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState<number | null>(null);

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
    }, [reservations]); // Refresh when reservations change

    // Fetch reservations for the selected date
    const fetchReservations = async () => {
        if (!date) return;
        setLoading(true);
        try {
            const dateStr = format(date, 'dd-MM-yyyy');
            const data = await getReservations(dateStr);
            // Sort by time
            const sorted = [...data].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
            setReservations(sorted);
        } catch (error) {
            console.error("Failed to fetch reservations", error);
            setReservations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, [date]);

    // Delete handler
    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this reservation?')) return;
        
        setDeleting(id);
        try {
            const result = await deleteReservation(id);
            if (result.success) {
                // Refresh the list
                fetchReservations();
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
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Reservations</h1>
                    <p className="text-muted-foreground mt-1">Manage and view daily bookings</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Calendar Side */}
                <Card className="md:col-span-4 lg:col-span-3 h-fit border-border/60 shadow-md flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-primary" />
                            Select Date
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="p-4"
                            modifiers={{
                                booked: bookedDates
                            }}
                            modifiersClassNames={{
                                booked: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-primary after:rounded-full after:opacity-70 font-bold"
                            }}
                        />
                    </CardContent>
                    <div className="p-4 border-t border-border/40 bg-muted/20">
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground w-full">
                            <span className="w-2 h-2 bg-primary rounded-full opacity-70"></span>
                            <span className="font-medium">Points indicate existing bookings</span>
                        </div>
                    </div>
                </Card>

                {/* List Side */}
                <Card className="md:col-span-8 lg:col-span-9 border-border/60 shadow-md min-h-[500px]">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                           <span>Bookings for {date ? format(date, 'MMM dd, yyyy') : 'Selected Date'}</span>
                           <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                               {reservations.length} Bookings
                           </Badge>
                        </CardTitle>
                        <CardDescription>
                            Reservations sorted by time. Click trash to delete.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-pulse">
                                <Clock className="w-10 h-10 mb-2 opacity-20" />
                                <span>Loading reservations...</span>
                            </div>
                        ) : reservations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed border-border/50 rounded-xl bg-muted/5">
                                <CalendarIcon className="w-12 h-12 mb-4 opacity-10" />
                                <p className="text-lg font-medium opacity-80">No reservations found</p>
                                <p className="text-sm opacity-50">Select another date or wait for new bookings.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {reservations.map((res, idx) => (
                                    <motion.div 
                                        key={res.id || idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
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
                                                        {res.date}
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
