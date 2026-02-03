'use client';

import { useActionState } from 'react';
import { loginAdmin, LoginState } from '@/app/admin/actions';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { UtensilsCrossed, Mail, Lock, ArrowRight } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-100/50 to-transparent -z-10" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl opacity-50" />
            <div className="absolute top-1/2 -right-24 w-64 h-64 bg-teal-200/30 rounded-full blur-3xl opacity-50" />

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-2xl overflow-hidden relative z-10">
                <div className="p-10 space-y-8">
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-emerald-50 text-emerald-600 mb-4 shadow-sm ring-1 ring-emerald-100">
                            <UtensilsCrossed className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Portal</h1>
                        <p className="text-slate-500">Sign in to manage <span className="font-semibold text-emerald-600">Bhojone</span> reservations</p>
                    </div>

                    <form action={formAction} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="admin@example.com"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {state.error && (
                            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium text-center border border-red-100 animate-in fade-in slide-in-from-top-2 flex items-center justify-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                {state.error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isPending ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
                <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-center backdrop-blur-sm">
                    <p className="text-xs font-medium text-slate-400 flex items-center justify-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Secure System • Bhojone Restaurant
                    </p>
                </div>
            </div>
        </div>
    );
}
