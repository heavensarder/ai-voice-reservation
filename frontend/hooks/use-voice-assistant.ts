import { useState, useRef, useEffect, useCallback } from 'react';
import { Message, ConnectionStatus, AgentState } from '@/types';

export function useVoiceAssistant() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [agentState, setAgentState] = useState<AgentState>('idle');
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const [reviewData, setReviewData] = useState<any | null>(null);

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
    
    // We need a stable reference to startRecording to call it from audio.onended
    const startRecordingRef = useRef<() => void>(() => {});

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
        setStatus('disconnected');
    }, [stopRecording]);

    const manualStop = useCallback(() => {
        shouldAutoRestartRef.current = false;
        stopRecording();
    }, [stopRecording]);

    // Function to play audio blob
    const playAudioCallback = useCallback((audioBlob: Blob) => {
        setAgentState('speaking');
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
             // AUTO-CLOSE: If reservation was confirmed, disconnect
             if (shouldDisconnectAfterPromptRef.current) {
                 setAgentState('idle');
                 shouldDisconnectAfterPromptRef.current = false; // Reset
                 // Disconnect after a brief pause
                 setTimeout(() => {
                     disconnect();
                 }, 1000);
                 URL.revokeObjectURL(audioUrl);
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
            URL.revokeObjectURL(audioUrl);
        };

        audio.play().catch(e => console.error("Audio playback error", e));
    }, [disconnect]);

    const connect = useCallback(() => {
        setStatus('connecting');
        shouldDisconnectAfterPromptRef.current = false; // Reset on connect
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
                    // Show Review Card
                    setReviewData(data.data);
                } else if (data.type === 'reservation_confirmed') {
                    shouldDisconnectAfterPromptRef.current = true;
                    
                    const payload = data.data || reviewData;
                    
                    if (payload) {
                        const { saveReservation } = await import('@/app/actions');
                        try {
                            const result = await saveReservation(payload);
                            if (result.success) {
                                setMessages(prev => [...prev, { role: 'ai', content: `[System]: Reservation Saved (ID: ${result.id})` }]);
                            } else {
                                setMessages(prev => [...prev, { role: 'ai', content: '[System]: Error saving reservation' }]);
                            }
                        } catch (err) {
                            console.error("Action Error", err);
                        }
                    }
                }
            } else if (event.data instanceof Blob) {
                setAgentState('speaking');
                playAudioCallback(event.data);
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
    }, [playAudioCallback]);

    const startRecording = useCallback(async () => {
        try {
            shouldAutoRestartRef.current = true; // Enable loop on start
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            isRecordingRef.current = true;

            // Max Recording Timeout (Safety valve)
            const MAX_DURATION = 5000; // 5 seconds
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
                
                // Threshold for silence (Lowered for sensitivity)
                const THRESHOLD = 0.01; 

                if (rms > THRESHOLD) {
                    silenceStart = Date.now(); // Reset silence timer
                    if (silenceTimerRef.current) {
                        clearTimeout(silenceTimerRef.current);
                        silenceTimerRef.current = null;
                    }
                } else {
                    // Check if silence duration exceeded 1.0 seconds (Faster response)
                    if (Date.now() - silenceStart > 1000) {
                        if (!silenceTimerRef.current) {
                            // Debounce the stop triggers
                            silenceTimerRef.current = setTimeout(() => {
                                console.log("Silence detected, stopping recording...");
                                stopRecording(); // VAD stop keeps loop enabled
                            }, 500); 
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

    // Disconnect moved up
    // Update ref so playAudioCallback can access the latest startRecording
    useEffect(() => {
        startRecordingRef.current = startRecording;
    }, [startRecording]);

    return {
        messages,
        status,
        agentState,
        permissionError,
        reviewData,
        connect,
        disconnect,
        startRecording,
        stopRecording,
        manualStop
    };
}
