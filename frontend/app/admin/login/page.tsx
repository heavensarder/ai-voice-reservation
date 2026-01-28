'use client';

import { useActionState } from 'react';
import { loginAdmin, LoginState } from '@/app/admin/actions';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

const initialState: LoginState = {
    error: '',
    success: false
};

export default function AdminLogin() {
    const [state, formAction, isPending] = useActionState(loginAdmin, initialState);

    useEffect(() => {
        if (state.success) {
            redirect('/admin/dashboard');
        }
    }, [state.success]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl border border-gray-200 shadow-xl">
                <h1 className="text-2xl font-bold text-center text-gray-800">Admin Login</h1>

                <form action={formAction} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                        />
                    </div>

                    {state.error && (
                        <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded border border-red-100">
                            {state.error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors disabled:opacity-50 text-white"
                    >
                        {isPending ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
}
