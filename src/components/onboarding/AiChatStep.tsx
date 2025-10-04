import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Mic, MicOff } from 'lucide-react';

interface AiChatStepProps {
  onCompletion: (data: any) => void;
  onError: (title: string, description: string) => void;
  userType: 'vendor' | 'staff';
}

const AiChatStep = ({ onCompletion, onError, userType }: AiChatStepProps): JSX.Element => {
  const [messages, setMessages] = useState<{ type: 'user' | 'ai'; text: string; data?: any }[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [aiStatus, setAiStatus] = useState('Idle');
  const [collectedData, setCollectedData] = useState<any>({});
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReadyForInput, setIsReadyForInput] = useState(false);

  const ws = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Audio constants
  const SEND_SAMPLE_RATE = 16000;
  const PLAYBACK_SAMPLE_RATE = 24000;
  const WS_URL = 'ws://localhost:8765/vendor/onboard';

  // Helper functions
  const downsampleBuffer = useCallback((buffer: Float32Array, inputSampleRate: number, outputSampleRate: number): Float32Array => {
    if (outputSampleRate === inputSampleRate) return buffer;
    const sampleRateRatio = inputSampleRate / outputSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0, count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = accum / count;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  }, []);

  const toPcm16 = useCallback((input: Float32Array): Uint8Array => {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return new Uint8Array(buffer);
  }, []);

  const base64ToArrayBuffer = useCallback((base64: string): ArrayBuffer => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }, []);

  const playNextInQueue = useCallback(async () => {
    if (audioQueueRef.current.length === 0) {
      setIsPlaying(false);
      setAiStatus('Idle');
      return;
    }

    setIsPlaying(true);
    setAiStatus('Speaking');
    const audioData = audioQueueRef.current.shift()!;

    try {
      if (!audioContextRef.current) return;
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      if (!gainNodeRef.current) {
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.gain.value = 1.0;
        gainNodeRef.current.connect(audioContextRef.current.destination);
      }
      
      // Convert Int16 PCM to Float32
      const int16Array = new Int16Array(audioData);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }
      
      // Create audio buffer with correct sample rate
      const audioBuffer = audioContextRef.current.createBuffer(1, float32Array.length, PLAYBACK_SAMPLE_RATE);
      audioBuffer.getChannelData(0).set(float32Array);

      currentSourceRef.current = audioContextRef.current.createBufferSource();
      currentSourceRef.current.buffer = audioBuffer;
      currentSourceRef.current.connect(gainNodeRef.current);
      currentSourceRef.current.onended = () => {
        currentSourceRef.current = null;
        playNextInQueue();
      };
      currentSourceRef.current.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      setTimeout(() => playNextInQueue(), 100);
    }
  }, []);

  const interruptPlayback = useCallback(() => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.onended = null;
        currentSourceRef.current.stop();
      } catch (e) {
        console.warn("Error stopping audio source:", e);
      }
      currentSourceRef.current = null;
    }
    audioQueueRef.current = [];
    setIsPlaying(false);
  }, []);

  // Stable reference for playNextInQueue to avoid stale closures
  const playNextInQueueRef = useRef(playNextInQueue);
  useEffect(() => {
    playNextInQueueRef.current = playNextInQueue;
  }, [playNextInQueue]);

  // Main effect for WebSocket connection and lifecycle management
  useEffect(() => {
    // Prevent multiple connections
    if (ws.current) return;

    console.log('Initializing WebSocket connection...');
    const websocket = new WebSocket(WS_URL);
    ws.current = websocket;

    websocket.onopen = async () => {
      console.log('WebSocket connected');
      setAiStatus('Initializing...');
      toast({ title: "Connection established", variant: "default" });

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      setTimeout(() => {
        setIsReadyForInput(true);
        setAiStatus('Ready');
      }, 1000);
    };

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'audio' && message.data) {
          const audioDataBuffer = base64ToArrayBuffer(message.data);
          audioQueueRef.current.push(audioDataBuffer);
          if (!currentSourceRef.current) {
            playNextInQueueRef.current();
          }
        } else if (message.type === 'text') {
          setMessages((prev) => [...prev, { type: 'ai', text: message.data }]);
        } else if (message.type === 'json') {
          setCollectedData((prev) => ({ ...prev, ...message.content }));
          setMessages((prev) => [...prev, { type: 'ai', text: 'I\'ve noted that information.' }]);
        } else if (message.type === 'interrupted') {
          interruptPlayback();
        } else if (message.type === 'error') {
          onError("AI Error", message.content || "An unknown error occurred.");
          setAiStatus('Error');
        }
      } catch (error) {
        console.error('Error parsing message:', error);
        onError("AI Response Error", "Received malformed data from AI.");
        setAiStatus('Error');
      }
    };

    websocket.onclose = (event) => {
      console.log('WebSocket disconnected', event);
      setAiStatus('Disconnected');
      setIsReadyForInput(false);
      if (event.code !== 1000) {
        onError("Unexpected Disconnect", `Connection closed. Code: ${event.code}.`);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setAiStatus('Error');
      onError("Connection Error", "Failed to connect to the AI assistant.");
    };

    // Cleanup function
    return () => {
      console.log('Cleaning up WebSocket connection...');
      if (websocket.readyState === WebSocket.OPEN || websocket.readyState === WebSocket.CONNECTING) {
        websocket.close(1000, 'Component unmounting');
      }
      ws.current = null;
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, []); // Empty deps - only run once

  const startRecording = useCallback(async () => {
    if (isRecording) return;
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      onError("Connection Error", "WebSocket is not connected.");
      return;
    }

    interruptPlayback();
    setAiStatus('Listening...');

    try {
      const audioContext = audioContextRef.current;
      if (!audioContext) throw new Error("AudioContext not initialized.");
      if (audioContext.state === 'suspended') await audioContext.resume();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const source = audioContext.createMediaStreamSource(stream);
      processorRef.current = audioContext.createScriptProcessor(4096, 1, 1);

      processorRef.current.onaudioprocess = (event) => {
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
        const inputBuffer = event.inputBuffer.getChannelData(0);
        const downsampled = downsampleBuffer(inputBuffer, audioContext.sampleRate, SEND_SAMPLE_RATE);
        const pcm16 = toPcm16(downsampled);
        const base64 = btoa(String.fromCharCode(...pcm16));
        ws.current.send(JSON.stringify({ type: 'audio', data: base64 }));
      };

      source.connect(processorRef.current);
      processorRef.current.connect(audioContext.destination);

      setIsRecording(true);
      ws.current.send(JSON.stringify({ type: 'start_user_turn', userType }));
    } catch (error) {
      console.error('Error starting recording:', error);
      onError("Microphone Error", "Could not access microphone. Please grant permission.");
      setAiStatus('Idle');
    }
  }, [isRecording, interruptPlayback, onError, userType, downsampleBuffer, toPcm16]);

  const stopRecording = useCallback(() => {
    if (!isRecording) return;
    setIsRecording(false);
    setAiStatus('Thinking...');

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'end_user_turn' }));
    }
  }, [isRecording]);

  const handleSendMessage = useCallback(() => {
    if (inputMessage.trim() === '' || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    
    interruptPlayback();
    setMessages((prev) => [...prev, { type: 'user', text: inputMessage }]);
    setAiStatus('Thinking...');
    ws.current.send(JSON.stringify({ type: 'text', content: inputMessage, userType }));
    setInputMessage('');
  }, [inputMessage, userType, interruptPlayback]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (collectedData.name && collectedData.email) {
      onCompletion(collectedData);
    }
  }, [collectedData, onCompletion]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const isBusy = isRecording || isPlaying;

  return (
    <Card className="flex flex-col h-full p-4">
      <h2 className="text-2xl font-bold mb-4">AI Onboarding Assistant</h2>
      <ScrollArea className="flex-grow bg-gray-100 dark:bg-gray-800 p-4 rounded-md mb-4" ref={chatHistoryRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${msg.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 dark:bg-gray-700'}`}>
              {msg.text}
            </span>
          </div>
        ))}
      </ScrollArea>
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder={isReadyForInput ? "Type your message or speak..." : "Connecting to AI..."}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-grow"
          disabled={!isReadyForInput || isBusy}
        />
        <Button onClick={handleSendMessage} disabled={!isReadyForInput || inputMessage.trim() === '' || isBusy}>
          Send
        </Button>
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!isReadyForInput || (isPlaying && !isRecording)}
          variant={isRecording ? "destructive" : "default"}
        >
          {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          <span className="sr-only">{isRecording ? "Stop Recording" : "Start Recording"}</span>
        </Button>
      </div>
      <div className="text-sm text-gray-500 mt-2">Status: {aiStatus}</div>
    </Card>
  );
};

export default AiChatStep;