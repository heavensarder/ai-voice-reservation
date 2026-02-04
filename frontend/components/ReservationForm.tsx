'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Users, Phone, Clock, User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { saveReservation } from '@/app/actions';
import { formatTo12Hour } from '@/utils/time';

interface ReservationFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function ReservationForm({ onSuccess, onCancel }: ReservationFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        date: '',
        time: '',
        guests: '2'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            // Basic validation
            if (!formData.name || !formData.phone || !formData.date || !formData.time) {
                throw new Error("Please fill in all fields");
            }

            const result = await saveReservation({
                name: formData.name,
                phone: formData.phone,
                date: formData.date,
                time: formatTo12Hour(formData.time), // Convert 24h input to 12h
                people: formData.guests
            });

            if (result.success) {
                setStatus('success');
                setFormData({
                    name: '',
                    phone: '',
                    date: '',
                    time: '',
                    guests: '2'
                });
                // Auto-close modal on success after delay
                if (onSuccess) {
                    setTimeout(() => {
                        onSuccess();
                    }, 2000);
                }
            } else {
                setStatus('error');
                setMessage(result.error || "Failed to make reservation");
            }
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-[350px] w-full max-w-lg bg-card rounded-3xl overflow-hidden shadow-2xl border border-border/50 ring-1 ring-black/5 dark:ring-white/10 h-full">

            {/* Header */}
            <div className="bg-muted/50 p-4 border-b border-border flex justify-between items-center backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                <h2 className="text-card-foreground font-semibold text-lg flex items-center gap-2 tracking-tight">
                    <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <CalendarIcon size={16} />
                    </span>
                    Manual Booking
                </h2>
                <div className="text-[10px] px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground font-bold tracking-wider uppercase">
                    Form
                </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 p-6 space-y-5">
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Name */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground ml-1 uppercase tracking-wider flex items-center gap-1.5">
                            <User size={12} /> Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Type your name"
                            className="w-full px-4 py-2.5 rounded-xl bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50 text-sm"
                        />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground ml-1 uppercase tracking-wider flex items-center gap-1.5">
                            <Phone size={12} /> Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="01XXXXXXXXX"
                            className="w-full px-4 py-2.5 rounded-xl bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50 text-sm font-mono"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Date */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground ml-1 uppercase tracking-wider flex items-center gap-1.5">
                                <CalendarIcon size={12} /> Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm appearance-none"
                            />
                        </div>

                        {/* Time */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground ml-1 uppercase tracking-wider flex items-center gap-1.5">
                                <Clock size={12} /> Time
                            </label>
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-xl bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm appearance-none"
                            />
                        </div>
                    </div>

                    {/* Guests */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground ml-1 uppercase tracking-wider flex items-center gap-1.5">
                            <Users size={12} /> Guests
                        </label>
                        <select
                            name="guests"
                            value={formData.guests}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 rounded-xl bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                                <option key={num} value={num}>{num} People</option>
                            ))}
                        </select>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={clsx(
                            "w-full py-3 rounded-xl font-medium text-sm transition-all duration-200 mt-2 flex items-center justify-center gap-2",
                            isLoading
                                ? "bg-muted text-muted-foreground cursor-not-allowed"
                                : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
                        )}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={16} /> Processing...
                            </>
                        ) : (
                            <>
                                Confirm Booking <CheckCircle2 size={16} />
                            </>
                        )}
                    </button>
                </form>

                {/* Status Messages */}
                <AnimatePresence mode="wait">
                    {status === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3"
                        >
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="text-emerald-500" size={16} />
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold text-emerald-600 dark:text-emerald-400">Success!</p>
                                <p className="text-emerald-600/80 dark:text-emerald-400/80 text-xs">Your table has been reserved.</p>
                            </div>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
                        >
                            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                                <AlertCircle className="text-red-500" size={16} />
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold text-red-600 dark:text-red-400">Error</p>
                                <p className="text-red-600/80 dark:text-red-400/80 text-xs">{message}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
