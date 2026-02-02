

export default async function AdminDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
                <p className="text-muted-foreground">Welcome back to your reservation management system.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 <div className="p-6 rounded-xl border border-border bg-card text-card-foreground shadow-sm space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Reservations</h3>
                    <div className="text-2xl font-bold">128</div>
                 </div>
                 <div className="p-6 rounded-xl border border-border bg-card text-card-foreground shadow-sm space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Today's Bookings</h3>
                    <div className="text-2xl font-bold">12</div>
                 </div>
                 <div className="p-6 rounded-xl border border-border bg-card text-card-foreground shadow-sm space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Pending Requests</h3>
                    <div className="text-2xl font-bold">4</div>
                 </div>
            </div>
        </div>
    );
}
