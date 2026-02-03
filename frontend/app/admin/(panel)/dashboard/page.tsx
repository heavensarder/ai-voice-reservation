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
        <div className="space-y-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
                <p className="text-slate-500">Welcome back to your reservation management system.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 group">
                    <div className="flex items-center gap-3 text-slate-500 mb-4 group-hover:text-emerald-600 transition-colors">
                        <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-emerald-50 transition-colors">
                            <CalendarDays className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider">Total Reservations</h3>
                    </div>
                    <div className="text-4xl font-bold text-slate-800">{allReservations.length}</div>
                    <p className="text-xs text-slate-400 mt-2 font-medium">All time bookings</p>
                </div>
                <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 group">
                    <div className="flex items-center gap-3 text-slate-500 mb-4 group-hover:text-emerald-600 transition-colors">
                        <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-emerald-50 transition-colors">
                            <Clock className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider">Today's Bookings</h3>
                    </div>
                    <div className="text-4xl font-bold text-emerald-600">{todayReservations.length}</div>
                    <p className="text-xs text-slate-400 mt-2 font-medium">{todayStr}</p>
                </div>
                <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 group">
                    <div className="flex items-center gap-3 text-slate-500 mb-4 group-hover:text-emerald-600 transition-colors">
                        <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-emerald-50 transition-colors">
                            <Users className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider">Today's Guests</h3>
                    </div>
                    <div className="text-4xl font-bold text-slate-800">{todayGuests}</div>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Expected visitors</p>
                </div>
                <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 group">
                    <div className="flex items-center gap-3 text-slate-500 mb-4 group-hover:text-emerald-600 transition-colors">
                        <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-emerald-50 transition-colors">
                            <CalendarDays className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider">This Week</h3>
                    </div>
                    <div className="text-4xl font-bold text-slate-800">{upcomingReservations.length}</div>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Upcoming bookings</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Today's Reservations */}
                <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-800">Today's Schedule</h2>
                        <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">{todayReservations.length} Bookings</span>
                    </div>

                    {todayReservations.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No reservations for today.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {todayReservations.map((res, idx) => (
                                <div key={res.id || idx} className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-300">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-white text-emerald-600 shadow-sm px-4 py-3 rounded-xl text-center min-w-[80px] border border-slate-100 group-hover:border-emerald-200 transition-colors">
                                            <div className="text-sm font-bold">{res.time}</div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-lg">{res.name}</h4>
                                            <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mt-1">
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

                {/* Upcoming Reservations Table */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-slate-800">Upcoming Reservations</h2>
                        <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline">View All</button>
                    </div>

                    {upcomingReservations.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium text-lg">No upcoming reservations found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                        <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Time</th>
                                        <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Guest info</th>
                                        <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="py-4 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">People</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {upcomingReservations.slice(0, 10).map((res, idx) => (
                                        <tr key={res.id || idx} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                                            <td className="py-4 px-4 font-medium text-slate-600">{formatDisplayDate(res.date)}</td>
                                            <td className="py-4 px-4">
                                                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold group-hover:bg-white group-hover:shadow-sm transition-all">
                                                    {res.time}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="font-bold text-slate-800">{res.name}</div>
                                                <div className="text-slate-400 text-xs font-mono mt-0.5">{res.phone}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    Confirmed
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1 font-bold text-slate-700">
                                                    <Users className="w-4 h-4 text-slate-400" />
                                                    {res.people}
                                                </div>
                                            </td>
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
