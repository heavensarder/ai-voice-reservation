'use client';

import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Volume2, Calendar as CalendarIcon, Users, Phone, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useVoiceAssistant } from '@/hooks/use-voice-assistant';

export default function VoiceAgent() {
    const {
        messages,
        status,
        agentState,
        permissionError,
        connect,
        disconnect,
        startRecording,
        stopRecording,
        manualStop,
        reviewData,
        saveError,
        saveSuccess,
        resetReservationStatus
    } = useVoiceAssistant();

    const bottomRef = useRef<HTMLDivElement>(null);



    const handleMicClick = () => {
        if (status === 'disconnected') {
            connect();
            return;
        }

        if (agentState === 'listening') {
            manualStop();
        } else {
            startRecording();
        }
    };

    return (
        <>
            {/* Modal Overlay for Confirmation (High Z-Index) */}
            <AnimatePresence>
                {reviewData && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-card rounded-3xl overflow-hidden shadow-2xl border border-border/50 ring-1 ring-white/10"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-4 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                        <CalendarIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg tracking-wide">
                                            Reservation Details
                                        </h3>
                                        <p className="text-white/70 text-xs">Please confirm your booking</p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                                <div className="flex items-center justify-between py-3 border-b border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                            <Users className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <span className="text-slate-400 text-sm uppercase tracking-wider">Guest Name</span>
                                    </div>
                                    <span className="text-white font-semibold text-base">{reviewData.name}</span>
                                </div>

                                <div className="flex items-center justify-between py-3 border-b border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                            <Phone className="w-4 h-4 text-purple-400" />
                                        </div>
                                        <span className="text-slate-400 text-sm uppercase tracking-wider">Phone</span>
                                    </div>
                                    <span className="text-white font-semibold text-base font-mono">{reviewData.phone}</span>
                                </div>

                                <div className="flex items-center justify-between py-3 border-b border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                            <CalendarIcon className="w-4 h-4 text-orange-400" />
                                        </div>
                                        <span className="text-slate-400 text-sm uppercase tracking-wider">Date</span>
                                    </div>
                                    <span className="text-white font-semibold text-base">{reviewData.date}</span>
                                </div>

                                <div className="flex items-center justify-between py-3 border-b border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-pink-400" />
                                        </div>
                                        <span className="text-slate-400 text-sm uppercase tracking-wider">Time</span>
                                    </div>
                                    <span className="text-white font-semibold text-base">{reviewData.time}</span>
                                </div>

                                <div className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                            <Users className="w-4 h-4 text-cyan-400" />
                                        </div>
                                        <span className="text-slate-400 text-sm uppercase tracking-wider">Guests</span>
                                    </div>
                                    <span className="text-white font-semibold text-base">{reviewData.people} People</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-slate-900 px-6 py-4 border-t border-white/10 flex justify-center">
                                <p className="text-center text-emerald-400 text-sm font-medium animate-pulse flex items-center gap-2">
                                    <Mic className="w-4 h-4" /> Say <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">"হ্যাঁ"</span> or <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">"Yes"</span> to confirm
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Success/Error Toast Notification (Fixed Top Center) */}
            <AnimatePresence>
                {saveSuccess && (
                    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-4 w-full max-w-sm">
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.9 }}
                            className="bg-emerald-50 text-emerald-900 dark:bg-emerald-900/90 dark:text-emerald-50 p-4 rounded-xl shadow-2xl border border-emerald-200 dark:border-emerald-700 flex items-center gap-3 backdrop-blur-md relative"
                        >
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center shrink-0">
                                <span className="text-xl">✅</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold">Booking Confirmed!</h4>
                                <p className="text-sm opacity-90">Thank you for your reservation.</p>
                            </div>
                            <button
                                onClick={resetReservationStatus}
                                className="p-1 rounded-full hover:bg-black/10 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </motion.div>
                    </div>
                )}
                {saveError && (
                    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-4 w-full max-w-sm">
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.9 }}
                            className="bg-red-50 text-red-900 dark:bg-red-900/90 dark:text-red-50 p-4 rounded-xl shadow-2xl border border-red-200 dark:border-red-700 flex items-center gap-3 backdrop-blur-md relative"
                        >
                            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center shrink-0">
                                <span className="text-xl">❌</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold">Booking Failed</h4>
                                <p className="text-sm opacity-90">{saveError}</p>
                            </div>
                            <button
                                onClick={resetReservationStatus}
                                className="p-1 rounded-full hover:bg-black/10 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Floating Action Button (Bottom Right) */}
            <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">

                {/* Status/Transcript Bubble */}
                <AnimatePresence>
                    {(agentState === 'listening' || agentState === 'speaking' || agentState === 'thinking') && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.8, x: 20 }}
                            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                            exit={{ opacity: 0, y: 10, scale: 0.8, x: 20 }}
                            className="bg-card text-card-foreground px-5 py-3 rounded-2xl shadow-xl border border-border mb-2 max-w-[250px] relative"
                        >
                            <div className="text-sm font-medium flex items-center gap-2">
                                {agentState === 'listening' && (
                                    <>
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                        </span>
                                        <span className="text-red-500">Listening...</span>
                                    </>
                                )}
                                {agentState === 'thinking' && (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                                        <span className="text-indigo-500">Thinking...</span>
                                    </>
                                )}
                                {agentState === 'speaking' && (
                                    <>
                                        <Volume2 className="w-3.5 h-3.5 text-primary animate-pulse" />
                                        <span className="text-primary">Speaking...</span>
                                    </>
                                )}
                            </div>
                            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-card border-b border-r border-border rotate-45"></div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main FAB */}
                <div className="relative group flex items-center gap-4">
                    {/* Label/Tooltip (Speech Bubble) */}
                    <AnimatePresence>
                        {agentState === 'idle' && (
                            <motion.div
                                initial={{ opacity: 0, x: 10, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 10, scale: 0.9 }}
                                className="relative bg-slate-900 text-white px-4 py-2 rounded-xl shadow-xl border border-slate-700 font-semibold text-sm whitespace-nowrap hidden md:block mr-2"
                            >
                                Call for Reservation
                                {/* Right Arrow */}
                                <div className="absolute top-1/2 -right-1.5 w-3 h-3 bg-slate-900 border-t border-r border-slate-700 transform -translate-y-1/2 rotate-45"></div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Ripple Effect */}
                    <AnimatePresence>
                        {(agentState === 'listening' || agentState === 'speaking') && (
                            <motion.div
                                initial={{ scale: 1, opacity: 0.4 }}
                                animate={{ scale: 1.8, opacity: 0 }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                                className={clsx("absolute right-0 top-0 bottom-0 w-16 h-16 rounded-full -z-10", {
                                    "bg-red-500": agentState === 'listening',
                                    "bg-primary": agentState === 'speaking',
                                })}
                            />
                        )}
                    </AnimatePresence>

                    {/* Idle Pulse Effect (Call Button) */}
                    {agentState === 'idle' && (
                        <>
                            <span className="absolute right-0 inline-flex h-16 w-16 rounded-full bg-emerald-500 opacity-20 animate-ping duration-2000 -z-10"></span>
                            <span className="absolute right-0 inline-flex h-16 w-16 rounded-full bg-emerald-500 opacity-10 animate-ping delay-300 duration-2000 -z-10"></span>
                        </>
                    )}

                    {/* End Session Button (Small, left of main button) */}
                    <AnimatePresence>
                        {status === 'connected' && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0, x: 20 }}
                                onClick={disconnect}
                                className="absolute right-20 bottom-2 w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-colors border-2 border-red-400 z-10"
                                title="End Session"
                            >
                                <Square fill="white" size={16} />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={handleMicClick}
                        disabled={status === 'connecting'}
                        className={clsx(
                            "w-16 h-16 rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 transform hover:scale-110 active:scale-95 border-2",
                            {
                                'bg-gradient-to-br from-red-500 to-red-600 text-white border-red-400': agentState === 'listening',
                                'bg-gradient-to-br from-primary to-indigo-600 text-white border-indigo-400': agentState === 'speaking',
                                'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white border-emerald-300': agentState === 'idle' || agentState === 'thinking', // Vibrant Call button style
                                'opacity-70 cursor-wait bg-gray-400': status === 'connecting'
                            }
                        )}
                    >
                        {agentState === 'listening' ? <Square fill="currentColor" size={24} /> :
                            agentState === 'speaking' ? <Volume2 size={24} className="animate-pulse" /> :
                                <Phone size={28} className={clsx({ "animate-[wiggle_1s_ease-in-out_infinite]": agentState === 'idle' })} />}
                    </button>

                    {/* Permission Error Tooltip */}
                    {permissionError && (
                        <div className="absolute bottom-full right-0 mb-3 w-48 bg-destructive text-destructive-foreground text-xs p-2 rounded-lg shadow-lg text-center">
                            {permissionError}
                            <div className="absolute -bottom-1 right-6 w-3 h-3 bg-destructive rotate-45"></div>
                        </div>
                    )}
                </div>
            </div>

            <div ref={bottomRef} className="sr-only" />
        </>
    );
}

// Helper icon component
function Loader2({ className, ...props }: any) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            {...props}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
