import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, FunctionDeclaration, Modality, LiveServerMessage } from "@google/genai";
import { SessionStatus } from '../types';
import { encode, decode, decodeAudioData } from '../lib/audioUtils';
import { WifiIcon } from '../Icons';

interface UseLiveSessionProps {
    systemInstruction: string;
    functionDeclarations: FunctionDeclaration[];
    onFunctionCall: (name: string, args: any) => void;
    vadThreshold: number;
}

export const useLiveSession = ({ systemInstruction, functionDeclarations, onFunctionCall, vadThreshold }: UseLiveSessionProps) => {
    const [status, setStatus] = useState<SessionStatus>(SessionStatus.DISCONNECTED);
    const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
    const [currentUtterance, setCurrentUtterance] = useState({ user: '', agent: '' });
    const [isSpeaking, setIsSpeaking] = useState(false);

    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const outputPlaybackTimeRef = useRef<number>(0);
    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');
    const vadThresholdRef = useRef(vadThreshold);

    React.useEffect(() => {
        vadThresholdRef.current = vadThreshold;
    }, [vadThreshold]);

    const stopSession = useCallback((closeSession = true) => {
        if (closeSession && sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
        }

        scriptProcessorRef.current?.disconnect();
        scriptProcessorRef.current = null;

        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;

        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close();
        }

        sessionPromiseRef.current = null;
        setAnalyserNode(null);
        setStatus(SessionStatus.DISCONNECTED);
        setIsSpeaking(false);
    }, []);

    const startSession = async () => {
        setStatus(SessionStatus.CONNECTING);
        setCurrentUtterance({ user: '', agent: '' });
        if (!process.env.API_KEY) {
            setStatus(SessionStatus.ERROR);
            alert("API_KEY environment variable not set.");
            return;
        }
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    tools: [{ functionDeclarations }],
                    systemInstruction
                },
                callbacks: {
                    onopen: async () => {
                        setStatus(SessionStatus.CONNECTED);
                        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
                        const source = inputAudioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
                        const analyser = inputAudioContextRef.current.createAnalyser();
                        setAnalyserNode(analyser);

                        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);

                            let rms = 0;
                            for (let i = 0; i < inputData.length; i++) {
                                rms += inputData[i] * inputData[i];
                            }
                            rms = Math.sqrt(rms / inputData.length);

                            if (rms < vadThresholdRef.current) {
                                setIsSpeaking(false);
                                return; // Don't send silent audio
                            }
                            setIsSpeaking(true);

                            const pcmBlob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(v => v * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(analyser);
                        analyser.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                            setCurrentUtterance(prev => ({...prev, user: currentInputTranscriptionRef.current}));
                        }
                        if (message.serverContent?.outputTranscription) {
                            currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                             setCurrentUtterance(prev => ({...prev, agent: currentOutputTranscriptionRef.current}));
                        }
                        if (message.serverContent?.turnComplete) {
                            currentInputTranscriptionRef.current = '';
                            currentOutputTranscriptionRef.current = '';
                            setCurrentUtterance({ user: '', agent: '' });
                        }
                        if (message.toolCall?.functionCalls) {
                            for (const fc of message.toolCall.functionCalls) {
                                onFunctionCall(fc.name, fc.args);
                                sessionPromiseRef.current?.then((session) => {
                                    session.sendToolResponse({
                                        functionResponses: { id: fc.id, name: fc.name, response: { result: 'OK' } }
                                    });
                                });
                            }
                        }
                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData && outputAudioContextRef.current) {
                            const audioCtx = outputAudioContextRef.current;
                            const decodedAudio = decode(audioData);
                            const audioBuffer = await decodeAudioData(decodedAudio, audioCtx, 24000, 1);
                            outputPlaybackTimeRef.current = Math.max(outputPlaybackTimeRef.current, audioCtx.currentTime);
                            const sourceNode = audioCtx.createBufferSource();
                            sourceNode.buffer = audioBuffer;
                            sourceNode.connect(audioCtx.destination);
                            sourceNode.start(outputPlaybackTimeRef.current);
                            outputPlaybackTimeRef.current += audioBuffer.duration;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error("Session error:", e);
                        setStatus(SessionStatus.ERROR);
                        stopSession();
                    },
                    onclose: () => {
                        stopSession(false);
                    },
                }
            });
        } catch (error) {
            console.error("Failed to start session:", error);
            setStatus(SessionStatus.ERROR);
        }
    };

    const renderStatus = (): React.ReactElement => {
        switch (status) {
            case SessionStatus.CONNECTED:
                return React.createElement(
                    'div',
                    { className: 'flex items-center space-x-2 text-green-400' },
                    React.createElement(
                        'span',
                        { className: 'relative flex h-3 w-3' },
                        React.createElement('span', {
                            className: 'animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75',
                        }),
                        React.createElement('span', {
                            className: 'relative inline-flex rounded-full h-3 w-3 bg-green-500',
                        })
                    ),
                    React.createElement('span', null, 'Listening...')
                );
            case SessionStatus.CONNECTING:
                return React.createElement(
                    'div',
                    { className: 'flex items-center space-x-2 text-yellow-400' },
                    React.createElement(WifiIcon, { className: 'w-5 h-5 animate-pulse' }),
                    React.createElement('span', null, 'Connecting...')
                );
            case SessionStatus.ERROR:
                return React.createElement(
                    'div',
                    { className: 'text-red-400' },
                    'Connection Error'
                );
            default:
                return React.createElement(
                    'div',
                    { className: 'text-gray-400' },
                    'Offline'
                );
        }
    };

    return { status, startSession, stopSession, analyserNode, currentUtterance, renderStatus, isSpeaking };
};
