import { useState, useRef, useEffect, useCallback } from 'react';
import { Message, ConnectionStatus, AgentState } from '@/types';

export function useVoiceAssistant() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [agentState, setAgentState] = useState<AgentState>('idle');
    const [permissionError, setPermissionError] = useState<string | null>(null);

    const websocketRef = useRef<WebSocket | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Function to play audio blob
    const playAudioCallback = useCallback((audioBlob: Blob) => {
        setAgentState('speaking');
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
            setAgentState('idle'); // Or 'listening' if continuous
            URL.revokeObjectURL(audioUrl);
        };

        audio.play().catch(e => console.error("Audio playback error", e));
    }, []);

    const connect = useCallback(() => {
        setStatus('connecting');
        // NOTE: In production, URL should be env var
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
                } else if (data.type === 'reservation_confirmed') {
                    // Call Server Action
                    const { saveReservation } = await import('@/app/actions');
                    try {
                        const result = await saveReservation(data.data);
                        if (result.success) {
                            setMessages(prev => [...prev, { role: 'ai', content: `[System]: Reservation Saved (ID: ${result.id})` }]);
                        } else {
                            setMessages(prev => [...prev, { role: 'ai', content: '[System]: Error saving reservation' }]);
                        }
                    } catch (err) {
                        console.error("Action Error", err);
                    }
                }
            } else if (event.data instanceof Blob) {
                // Binary audio data
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

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                // Send to backend
                if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
                    // We can allow backend to handle any audio format if using ffmpeg, 
                    // but browser usually sends WEBM. 
                    websocketRef.current.send(audioBlob);
                    setAgentState('thinking');
                }
            };

            mediaRecorder.start();
            setAgentState('listening');
            setPermissionError(null);
        } catch (err) {
            console.error("Mic Error", err);
            setPermissionError("Microphone access denied. Please enable permission.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            // State changes to thinking in onstop
        }
    };

    const disconnect = () => {
        if (websocketRef.current) {
            websocketRef.current.close();
        }
    };

    return {
        messages,
        status,
        agentState,
        permissionError,
        connect,
        disconnect,
        startRecording,
        stopRecording
    };
}
