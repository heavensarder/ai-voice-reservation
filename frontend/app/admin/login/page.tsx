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
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <div className="w-full max-w-md bg-card rounded-xl border border-border shadow-lg overflow-hidden">
                <div className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center p-3 rounded-xl bg-primary/10 text-primary mb-2">
                            <UtensilsCrossed className="w-8 h-8" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome Back</h1>
                        <p className="text-sm text-muted-foreground">Sign in to access your dashboard</p>
                    </div>

                    <form action={formAction} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="admin@example.com"
                                    className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-all text-sm"
                                />
                            </div>
                        </div>

                        {state.error && (
                            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium text-center border border-destructive/20 animate-in fade-in slide-in-from-top-2">
                                {state.error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isPending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
                <div className="p-4 bg-muted/20 border-t border-border text-center">
                    <p className="text-xs text-muted-foreground">
                        Protected System • AI Voice Reservation
                    </p>
                </div>
            </div>
        </div>
    );
}
