import { getReservations } from "@/app/actions";
import { CalendarDays, Users, Clock, Phone } from "lucide-react";

// Helper to parse DD-MM-YYYY to Date
function parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

// Helper to format Date to DD-MM-YYYY (for storage/comparison)
function formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

// Helper to format DD-MM-YYYY to "25 Feb 2026" (for display)
function formatDisplayDate(dateStr: string): string {
    if (!dateStr) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const [day, month, year] = parts.map(Number);
        return `${day} ${months[month - 1]} ${year}`;
    }
    return dateStr;
}

export default async function AdminDashboard() {
    // Get today's date in DD-MM-YYYY format
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = formatDate(today);
    
    // Get all reservations for statistics
    const allReservations = await getReservations();
    const todayReservations = allReservations.filter(r => r.date === todayStr);
    
    // Get upcoming reservations (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);
    
    const upcomingReservations = allReservations.filter(r => {
        const resDate = parseDate(r.date);
        return resDate >= today && resDate <= nextWeek;
    }).sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());

    // Calculate total guests for today
    const todayGuests = todayReservations.reduce((sum, r) => sum + (parseInt(r.people) || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
                <p className="text-muted-foreground">Welcome back to your reservation management system.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 rounded-xl border border-border bg-card text-card-foreground shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="w-4 h-4" />
                        <h3 className="text-sm font-medium">Total Reservations</h3>
                    </div>
                    <div className="text-3xl font-bold">{allReservations.length}</div>
                    <p className="text-xs text-muted-foreground">All time</p>
                </div>
                <div className="p-6 rounded-xl border border-border bg-card text-card-foreground shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <h3 className="text-sm font-medium">Today's Bookings</h3>
                    </div>
                    <div className="text-3xl font-bold text-primary">{todayReservations.length}</div>
                    <p className="text-xs text-muted-foreground">{todayStr}</p>
                </div>
                <div className="p-6 rounded-xl border border-border bg-card text-card-foreground shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <h3 className="text-sm font-medium">Today's Guests</h3>
                    </div>
                    <div className="text-3xl font-bold">{todayGuests}</div>
                    <p className="text-xs text-muted-foreground">Expected visitors</p>
                </div>
                <div className="p-6 rounded-xl border border-border bg-card text-card-foreground shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="w-4 h-4" />
                        <h3 className="text-sm font-medium">This Week</h3>
                    </div>
                    <div className="text-3xl font-bold">{upcomingReservations.length}</div>
                    <p className="text-xs text-muted-foreground">Upcoming bookings</p>
                </div>
            </div>

            {/* Today's Reservations */}
            <div className="rounded-xl border border-border bg-card shadow-sm">
                <div className="p-4 border-b border-border">
                    <h2 className="text-lg font-semibold">Today's Reservations</h2>
                </div>
                <div className="p-4">
                    {todayReservations.length === 0 ? (
                        <p className="text-muted-foreground text-sm text-center py-8">No reservations for today.</p>
                    ) : (
                        <div className="space-y-3">
                            {todayReservations.map((res, idx) => (
                                <div key={res.id || idx} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-center min-w-[70px]">
                                            <div className="text-sm font-bold">{res.time}</div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground">{res.name}</h4>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {res.phone}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {res.people} guests
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Upcoming Reservations */}
            <div className="rounded-xl border border-border bg-card shadow-sm">
                <div className="p-4 border-b border-border">
                    <h2 className="text-lg font-semibold">Upcoming Reservations (Next 7 Days)</h2>
                </div>
                <div className="p-4">
                    {upcomingReservations.length === 0 ? (
                        <p className="text-muted-foreground text-sm text-center py-8">No upcoming reservations.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Time</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Phone</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Guests</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {upcomingReservations.slice(0, 10).map((res, idx) => (
                                        <tr key={res.id || idx} className="border-b border-border/50 hover:bg-muted/30">
                                            <td className="py-3 px-4">{formatDisplayDate(res.date)}</td>
                                            <td className="py-3 px-4">{res.time}</td>
                                            <td className="py-3 px-4 font-medium">{res.name}</td>
                                            <td className="py-3 px-4 font-mono text-xs">{res.phone}</td>
                                            <td className="py-3 px-4">{res.people}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
