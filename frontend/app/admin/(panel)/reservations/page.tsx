import { getReservations, deleteReservation } from '@/app/actions';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function ReservationPage() {
    const session = (await cookies()).get('admin_session');
    if (!session) {
        redirect('/admin/login');
    }

    const reservations = await getReservations();

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <h1 className="text-3xl font-bold text-green-600">Dates & Bookings</h1>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4 border-b border-gray-200">ID</th>
                            <th className="px-6 py-4 border-b border-gray-200">Name</th>
                            <th className="px-6 py-4 border-b border-gray-200">Phone</th>
                            <th className="px-6 py-4 border-b border-gray-200">Date</th>
                            <th className="px-6 py-4 border-b border-gray-200">Time</th>
                            <th className="px-6 py-4 border-b border-gray-200">People</th>
                            <th className="px-6 py-4 text-right border-b border-gray-200">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {reservations.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                                    No reservations found.
                                </td>
                            </tr>
                        ) : (
                            reservations.map((res) => (
                                <tr key={res.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-mono text-gray-400">#{res.id}</td>
                                    <td className="px-6 py-4 text-gray-900 font-medium">{res.name}</td>
                                    <td className="px-6 py-4">{res.phone}</td>
                                    <td className="px-6 py-4 text-blue-600 font-medium">{res.date}</td>
                                    <td className="px-6 py-4 text-orange-600 font-bold">{res.time}</td>
                                    <td className="px-6 py-4">{res.people}</td>
                                    <td className="px-6 py-4 text-right">
                                        <form action={async () => {
                                            'use server';
                                            await deleteReservation(res.id);
                                            redirect('/admin/reservations');
                                        }}>
                                            <button className="text-red-500 hover:text-red-700 hover:underline font-medium">
                                                Delete
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
