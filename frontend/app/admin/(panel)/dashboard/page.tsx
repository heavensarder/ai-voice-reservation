import { getConfig, logoutAdmin } from '@/app/admin/actions';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import ConfigForm from './ConfigForm';

export default async function AdminDashboard() {
    const session = (await cookies()).get('admin_session');
    if (!session) {
        redirect('/admin/login');
    }

    const config = await getConfig();

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                    <h1 className="text-3xl font-bold text-blue-400">System Configuration</h1>
                    <div className="flex gap-2">
                        <a href="/admin/reservations" className="px-4 py-2 bg-green-600/20 text-green-400 hover:bg-green-600/30 rounded-lg border border-green-600/50 transition flex items-center gap-2">
                            <span>📅</span> View Reservations
                        </a>
                        <form action={async () => {
                            'use server';
                            await logoutAdmin();
                            redirect('/admin/login');
                        }}>
                            <button className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg border border-red-600/50 transition">
                                Logout
                            </button>
                        </form>
                    </div>
                </div>

                <ConfigForm initialConfig={config || {}} />

            </div>
        </div>
    );
}
