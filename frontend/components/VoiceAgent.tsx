'use client';

import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Volume2 } from 'lucide-react';
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
        stopRecording
    } = useVoiceAssistant();

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleStart = () => {
        if (status === 'disconnected') {
            connect();
        }
    };

    const handleMicClick = () => {
        if (status === 'disconnected') {
            connect();
            return;
        }

        if (agentState === 'listening') {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <div className="flex flex-col h-[600px] w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200 ring-1 ring-gray-100">

            {/* Header */}
            <div className="bg-gray-50/80 p-4 border-b border-gray-100 flex justify-between items-center backdrop-blur-md">
                <h2 className="text-gray-800 font-bold text-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Bangla Reservation AI
                </h2>
                <div className={clsx("text-xs px-2 py-1 rounded-full uppercase font-bold", {
                    'bg-red-100 text-red-600': status === 'disconnected' || status === 'error',
                    'bg-yellow-100 text-yellow-600': status === 'connecting',
                    'bg-green-100 text-green-600': status === 'connected',
                })}>
                    {status}
                </div>
            </div>

            {/* Transcript Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-20">
                        <p className="font-medium">কথা বলতে নিচের বাটনে চাপ দিন...</p>
                        <p className="text-xs mt-2">(Press the microphone to start speaking)</p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={clsx("p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm", {
                            "bg-blue-600 text-white self-end ml-auto rounded-br-none": msg.role === 'user',
                            "bg-white text-gray-800 self-start mr-auto rounded-bl-none border border-gray-200": msg.role === 'ai'
                        })}
                    >
                        {msg.content}
                    </motion.div>
                ))}
                {agentState === 'thinking' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1 text-gray-500 text-xs ml-2 font-medium">
                        <span>AI ভাবছে</span>
                        <span className="animate-bounce">.</span>
                        <span className="animate-bounce delay-75">.</span>
                        <span className="animate-bounce delay-150">.</span>
                    </motion.div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Controls Area */}
            <div className="p-6 bg-white border-t border-gray-100 flex flex-col items-center justify-center relative">
                {permissionError && (
                    <div className="absolute -top-12 left-0 right-0 bg-red-100 text-red-600 text-xs p-2 text-center border-b border-red-200 font-medium">
                        {permissionError}
                    </div>
                )}

                <div className="relative">
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
                                    "bg-blue-500": agentState === 'speaking'
                                })}
                            />
                        )}
                    </AnimatePresence>

                    <button
                        onClick={handleMicClick}
                        disabled={status === 'connecting'}
                        className={clsx("relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 border-4", {
                            'bg-red-500 hover:bg-red-600 text-white border-red-100': agentState === 'listening',
                            'bg-blue-500 hover:bg-blue-600 text-white border-blue-100': agentState === 'speaking',
                            'bg-white text-gray-700 hover:bg-gray-50 border-gray-100': agentState === 'idle' || agentState === 'thinking',
                            'opacity-50 cursor-not-allowed': status === 'connecting'
                        })}
                    >
                        {agentState === 'listening' ? <Square fill="currentColor" size={24} /> :
                            agentState === 'speaking' ? <Volume2 size={24} className="animate-pulse" /> :
                                <Mic size={24} />}
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <p className="text-gray-500 text-sm font-semibold">
                        {status === 'disconnected' ? 'বন্ধ আছে (Disconnected)' :
                            agentState === 'listening' ? 'শুনছি... (Listening)' :
                                agentState === 'thinking' ? 'প্রসেস হচ্ছে... (Thinking)' :
                                    agentState === 'speaking' ? 'কথা বলছে... (Speaking)' :
                                        'কথা বলতে ট্যাপ করুন (Tap to Speak)'}
                    </p>
                </div>
            </div>
        </div>
    );
}
