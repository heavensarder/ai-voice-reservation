import Link from 'next/link';
import { logoutAdmin } from '@/app/admin/actions';
import { redirect } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-gray-50 text-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Voice Admin
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        href="/admin/dashboard"
                        className="block px-4 py-3 rounded-lg hover:bg-gray-100/80 text-gray-600 hover:text-blue-600 font-medium transition flex items-center gap-3"
                    >
                        <span>⚙️</span> Configuration
                    </Link>
                    <Link
                        href="/admin/reservations"
                        className="block px-4 py-3 rounded-lg hover:bg-gray-100/80 text-gray-600 hover:text-blue-600 font-medium transition flex items-center gap-3"
                    >
                        <span>📅</span> Reservations
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <form action={async () => {
                        'use server';
                        await logoutAdmin();
                        redirect('/admin/login');
                    }}>
                        <button className="w-full px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg border border-red-200 transition text-sm font-medium flex items-center justify-center gap-2">
                            <span>🚪</span> Logout
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-50">
                {children}
            </main>
        </div>
    );
}
