import { useState, useRef, useEffect, useCallback } from 'react';
import { Message, ConnectionStatus, AgentState } from '@/types';

export function useVoiceAssistant() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [agentState, setAgentState] = useState<AgentState>('idle');
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const [reviewData, setReviewData] = useState<any | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

    // Use ref alongside state for stable access in callbacks
    const reviewDataRef = useRef<any | null>(null);

    const websocketRef = useRef<WebSocket | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // VAD Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isRecordingRef = useRef<boolean>(false);

    // Auto-restart control
    const shouldAutoRestartRef = useRef<boolean>(true);
    const shouldDisconnectAfterPromptRef = useRef<boolean>(false);

    // Audio queue system to prevent overlapping audio
    const audioQueueRef = useRef<Blob[]>([]);
    const isPlayingRef = useRef<boolean>(false);

    // We need a stable reference to startRecording to call it from audio.onended
    const startRecordingRef = useRef<() => void>(() => { });

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            isRecordingRef.current = false;
        }
        // Clear VAD context
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
    }, []);

    const disconnect = useCallback(() => {
        if (websocketRef.current) {
            websocketRef.current.close();
            websocketRef.current = null;
        }
        stopRecording();
        // Clear audio queue on disconnect
        audioQueueRef.current = [];
        isPlayingRef.current = false;
        setStatus('disconnected');
    }, [stopRecording]);

    const manualStop = useCallback(() => {
        shouldAutoRestartRef.current = false;
        stopRecording();
    }, [stopRecording]);

    // Process next audio in queue
    const processAudioQueue = useCallback(() => {
        if (audioQueueRef.current.length === 0) {
            isPlayingRef.current = false;

            // Only handle post-audio actions when queue is empty
            if (shouldDisconnectAfterPromptRef.current) {
                setAgentState('idle');
                shouldDisconnectAfterPromptRef.current = false;
                setTimeout(() => {
                    disconnect();
                }, 1000);
                return;
            }

            // AUTO-RESTART: Only if shouldAutoRestartRef is true
            if (shouldAutoRestartRef.current) {
                setTimeout(() => {
                    if (websocketRef.current?.readyState === WebSocket.OPEN) {
                        startRecordingRef.current();
                    } else {
                        setAgentState('idle');
                    }
                }, 500);
            } else {
                setAgentState('idle');
            }
            return;
        }

        isPlayingRef.current = true;
        setAgentState('speaking');

        const audioBlob = audioQueueRef.current.shift()!;
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            // Process next audio in queue
            processAudioQueue();
        };

        audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            // Continue with next audio even on error
            processAudioQueue();
        };

        audio.play().catch(e => {
            console.error("Audio playback error", e);
            processAudioQueue();
        });
    }, [disconnect]);

    // Add audio to queue and start playing if not already
    const queueAudio = useCallback((audioBlob: Blob) => {
        audioQueueRef.current.push(audioBlob);

        // Start processing if not already playing
        if (!isPlayingRef.current) {
            processAudioQueue();
        }
    }, [processAudioQueue]);

    const connect = useCallback(() => {
        setStatus('connecting');
        shouldDisconnectAfterPromptRef.current = false;
        audioQueueRef.current = []; // Clear queue on new connection
        isPlayingRef.current = false;

        const ws = new WebSocket('ws://localhost:8000/ws');

        ws.onopen = () => {
            setStatus('connected');
            console.log('WS Connected');
        };

        ws.onmessage = async (event) => {
            if (typeof event.data === 'string') {
                const data = JSON.parse(event.data);
                if (data.type === 'text') {
                    setMessages(prev => [...prev, { role: data.role, content: data.content }]);
                } else if (data.type === 'review_details') {
                    // Show Review Card - update both state and ref
                    setReviewData(data.data);
                    reviewDataRef.current = data.data;
                } else if (data.type === 'end_session') {
                    // Server signals conversation is complete - stop auto-restart loop
                    console.log('Session ended by server');
                    shouldAutoRestartRef.current = false;
                    shouldDisconnectAfterPromptRef.current = true;
                } else if (data.type === 'reservation_confirmed') {
                    shouldDisconnectAfterPromptRef.current = true;
                    shouldAutoRestartRef.current = false; // Stop loop immediately

                    // Prefer server-sent data, fallback to ref (not state due to closure issues)
                    const payload = data.data || reviewDataRef.current;

                    if (payload) {
                        const { saveReservation } = await import('@/app/actions');
                        try {
                            console.log('Saving reservation with payload:', payload);
                            const result = await saveReservation(payload);
                            if (result.success) {
                                console.log('Reservation saved successfully:', result.id);
                                setSaveSuccess(true);
                                setSaveError(null);
                                setMessages(prev => [...prev, { role: 'ai', content: `[System]: Reservation Saved (ID: ${result.id})` }]);
                            } else {
                                console.error('Save failed:', result.error);
                                setSaveError(result.error || 'Failed to save reservation');
                                setSaveSuccess(false);
                                setMessages(prev => [...prev, { role: 'ai', content: `[System]: Error - ${result.error}` }]);
                            }
                        } catch (err) {
                            console.error("Action Error", err);
                            setSaveError('Failed to save reservation');
                            setSaveSuccess(false);
                            setMessages(prev => [...prev, { role: 'ai', content: '[System]: Failed to save reservation' }]);
                        }
                        // Clear review data after processing
                        setReviewData(null);
                        reviewDataRef.current = null;
                    } else {
                        console.error("No payload for reservation confirmation");
                        setMessages(prev => [...prev, { role: 'ai', content: '[System]: Error - No data to save' }]);
                    }
                }
            } else if (event.data instanceof Blob) {
                // Queue audio instead of playing immediately
                queueAudio(event.data);
            }
        };

        ws.onclose = () => {
            setStatus('disconnected');
            console.log('WS Disconnected');
        };

        ws.onerror = (e) => {
            setStatus('error');
            console.error('WS Error', e);
        };

        websocketRef.current = ws;
    }, [queueAudio]);

    const startRecording = useCallback(async () => {
        try {
            shouldAutoRestartRef.current = true; // Enable loop on start

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            isRecordingRef.current = true;

            // Max Recording Timeout (Safety valve)
            const MAX_DURATION = 15000; // 15 seconds for longer inputs like phone numbers
            const maxTimeout = setTimeout(() => {
                if (isRecordingRef.current) {
                    console.log("Max duration reached, stopping...");
                    stopRecording();
                }
            }, MAX_DURATION);

            // --- Basic VAD Logic ---
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioContext;
            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(2048, 1, 1);

            source.connect(processor);
            processor.connect(audioContext.destination);

            let silenceStart = Date.now();

            processor.onaudioprocess = (e) => {
                if (!isRecordingRef.current) return;

                const input = e.inputBuffer.getChannelData(0);
                let sum = 0;
                for (let i = 0; i < input.length; i++) {
                    sum += input[i] * input[i];
                }
                const rms = Math.sqrt(sum / input.length);

                // Threshold for silence (lower = more sensitive)
                const THRESHOLD = 0.008; // Slightly more sensitive

                if (rms > THRESHOLD) {
                    silenceStart = Date.now(); // Reset silence timer
                    if (silenceTimerRef.current) {
                        clearTimeout(silenceTimerRef.current);
                        silenceTimerRef.current = null;
                    }
                } else {
                    // Check if silence duration exceeded 2.0 seconds (increased for phone numbers)
                    if (Date.now() - silenceStart > 2000) {
                        if (!silenceTimerRef.current) {
                            // Debounce the stop triggers
                            silenceTimerRef.current = setTimeout(() => {
                                console.log("Silence detected, stopping recording...");
                                stopRecording(); // VAD stop keeps loop enabled
                            }, 800); // Increased debounce for longer pauses
                        }
                    }
                }
            };
            // --- End VAD Logic ---

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                clearTimeout(maxTimeout); // Clear safety timeout
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                // Only send if we have data and socket is open
                if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN && audioBlob.size > 0) {
                    websocketRef.current.send(audioBlob);
                    setAgentState('thinking');
                }

                // Cleanup VAD tracks
                stream.getTracks().forEach(track => track.stop());
                if (audioContext.state !== 'closed') {
                    audioContext.close();
                }
            };

            mediaRecorder.start();
            setAgentState('listening');
            setPermissionError(null);
        } catch (err) {
            console.error("Mic Error", err);
            setPermissionError("Microphone access denied. Please enable permission.");
        }
    }, [stopRecording]);

    // Update ref so processAudioQueue can access the latest startRecording
    useEffect(() => {
        startRecordingRef.current = startRecording;
    }, [startRecording]);

    const resetReservationStatus = useCallback(() => {
        setSaveSuccess(false);
        setSaveError(null);
    }, []);

    return {
        messages,
        status,
        agentState,
        permissionError,
        reviewData,
        saveError,
        saveSuccess,
        connect,
        disconnect,
        startRecording,
        stopRecording,
        manualStop,
        resetReservationStatus
    };
}
