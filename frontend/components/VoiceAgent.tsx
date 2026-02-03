'use client';

import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Volume2, Calendar as CalendarIcon, Users, Phone, Clock } from 'lucide-react';
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
        saveSuccess
    } = useVoiceAssistant();

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

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
        <div className="flex flex-col min-h-[350px] w-full max-w-lg bg-card rounded-3xl overflow-hidden shadow-2xl border border-border/50 ring-1 ring-black/5 dark:ring-white/10">

            {/* Header */}
            <div className="bg-muted/50 p-4 border-b border-border flex justify-between items-center backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                <h2 className="text-card-foreground font-semibold text-lg flex items-center gap-2 tracking-tight">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    Bangla Reservation AI
                </h2>
                <div className={clsx("text-[10px] px-2.5 py-1 rounded-full uppercase font-bold tracking-wider", {
                    'bg-red-100 text-red-700': status === 'disconnected' || status === 'error',
                    'bg-yellow-100 text-yellow-700': status === 'connecting',
                    'bg-green-100 text-green-700': status === 'connected',
                })}>
                    {status}
                </div>
            </div>

            {/* Review Data Card (Visible when reviewData is present) */}
            <AnimatePresence>
                {reviewData && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="mx-4 mt-4 rounded-2xl overflow-hidden shadow-xl border border-white/20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <CalendarIcon className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm tracking-wide">
                                        Reservation Details
                                    </h3>
                                    <p className="text-white/70 text-[10px]">Please confirm your booking</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-5 space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                        <Users className="w-3.5 h-3.5 text-blue-400" />
                                    </div>
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">Guest Name</span>
                                </div>
                                <span className="text-white font-semibold text-sm">{reviewData.name}</span>
                            </div>
                            
                            <div className="flex items-center justify-between py-2 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                        <Phone className="w-3.5 h-3.5 text-purple-400" />
                                    </div>
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">Phone</span>
                                </div>
                                <span className="text-white font-semibold text-sm font-mono">{reviewData.phone}</span>
                            </div>
                            
                            <div className="flex items-center justify-between py-2 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                        <CalendarIcon className="w-3.5 h-3.5 text-orange-400" />
                                    </div>
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">Date</span>
                                </div>
                                <span className="text-white font-semibold text-sm">{reviewData.date}</span>
                            </div>
                            
                            <div className="flex items-center justify-between py-2 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-pink-500/20 flex items-center justify-center">
                                        <Clock className="w-3.5 h-3.5 text-pink-400" />
                                    </div>
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">Time</span>
                                </div>
                                <span className="text-white font-semibold text-sm">{reviewData.time}</span>
                            </div>
                            
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                                    </div>
                                    <span className="text-slate-400 text-xs uppercase tracking-wider">Guests</span>
                                </div>
                                <span className="text-white font-semibold text-sm">{reviewData.people} People</span>
                            </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="bg-gradient-to-r from-emerald-600/20 to-teal-500/20 px-5 py-3 border-t border-white/10">
                            <p className="text-center text-emerald-400 text-xs font-medium animate-pulse">
                                🎤 Say <span className="font-bold text-white">"হ্যাঁ"</span> or <span className="font-bold text-white">"Yes"</span> to confirm
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Display */}
            <AnimatePresence>
                {saveError && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="mx-4 mt-4 rounded-2xl overflow-hidden shadow-xl border border-red-500/30 bg-gradient-to-br from-red-950 via-red-900 to-red-950"
                    >
                        <div className="px-5 py-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                                <span className="text-2xl">❌</span>
                            </div>
                            <div>
                                <h4 className="text-red-300 font-bold text-sm">Reservation Failed</h4>
                                <p className="text-red-200/80 text-xs mt-0.5">{saveError}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success Display */}
            <AnimatePresence>
                {saveSuccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="mx-4 mt-4 rounded-2xl overflow-hidden shadow-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950"
                    >
                        <div className="px-5 py-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 animate-pulse">
                                <span className="text-2xl">✅</span>
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm">Reservation Confirmed!</h4>
                                <p className="text-emerald-200/80 text-xs mt-0.5">Your table has been successfully booked.</p>
                            </div>
                        </div>
                        <div className="bg-emerald-500/10 px-5 py-2 border-t border-emerald-500/20">
                            <p className="text-emerald-400/80 text-[10px] text-center">Thank you for choosing our restaurant 🙏</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Transcript Area - HIDDEN */}
            {/* <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                        <div className="bg-muted p-4 rounded-full mb-4">
                             <Mic className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="font-medium text-lg">কথা বলতে নিচের বাটনে চাপ দিন...</p>
                        <p className="text-sm opacity-70 mt-1">(Press the microphone to start speaking)</p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={clsx("p-3.5 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm", {
                            "bg-primary text-primary-foreground self-end ml-auto rounded-br-sm": msg.role === 'user',
                            "bg-background text-foreground self-start mr-auto rounded-bl-sm border border-border": msg.role === 'ai'
                        })}
                    >
                        {msg.content}
                    </motion.div>
                ))}
                {agentState === 'thinking' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1 text-muted-foreground text-xs ml-2 font-medium items-center">
                        <span>AI ভাবছে</span>
                        <span className="animate-bounce">.</span>
                        <span className="animate-bounce delay-75">.</span>
                        <span className="animate-bounce delay-150">.</span>
                    </motion.div>
                )}
                <div ref={bottomRef} />
            </div> */}

            {/* Controls Area - Centered and Clean */}
            <div className="flex-1 p-6 bg-card border-none flex flex-col items-center justify-center relative">
                {permissionError && (
                    <div className="absolute top-4 left-0 right-0 bg-destructive/10 text-destructive text-xs p-2 text-center border font-medium rounded-lg mx-4">
                        {permissionError}
                    </div>
                )}

                <div className="relative mt-2">
                    {/* Visualizer Ring */}
                    <AnimatePresence>
                        {(agentState === 'listening' || agentState === 'speaking') && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1.5, opacity: 0.3 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                className={clsx("absolute inset-0 rounded-full", {
                                    "bg-red-500": agentState === 'listening',
                                    "bg-primary": agentState === 'speaking'
                                })}
                            />
                        )}
                    </AnimatePresence>

                    <button
                        onClick={handleMicClick}
                        disabled={status === 'connecting'}
                        className={clsx("relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 border-[6px]", {
                            'bg-red-500 hover:bg-red-600 text-white border-red-50': agentState === 'listening',
                            'bg-primary hover:bg-primary/90 text-primary-foreground border-indigo-50': agentState === 'speaking',
                            'bg-white text-muted-foreground hover:bg-gray-50 border-gray-100': agentState === 'idle' || agentState === 'thinking',
                            'opacity-50 cursor-not-allowed': status === 'connecting'
                        })}
                    >
                        {agentState === 'listening' ? <Square fill="currentColor" size={32} /> :
                            agentState === 'speaking' ? <Volume2 size={36} className="animate-pulse" /> :
                                <Mic size={36} />}
                    </button>
                </div>

                <div className="mt-8 text-center h-8">
                    <p className="text-muted-foreground text-sm font-medium transition-all duration-300">
                        {status === 'disconnected' ? 'বন্ধ আছে (Disconnected)' :
                            agentState === 'listening' ? <span className="text-red-500 font-bold animate-pulse">শুনছি... (Listening)</span> :
                                agentState === 'thinking' ? <span className="text-indigo-500 font-bold animate-pulse">প্রসেস হচ্ছে... (Thinking)</span> :
                                    agentState === 'speaking' ? <span className="text-primary font-bold">AI কথা বলছে... (Speaking)</span> :
                                        'কথা বলতে ট্যাপ করুন (Tap to Speak)'}
                    </p>
                </div>
            </div>
        </div>
    );
}
