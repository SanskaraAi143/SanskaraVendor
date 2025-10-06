import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Mic, MicOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AiStaffOnboardingProps {
  onBack: () => void;
  onComplete: (data: any) => void;
  onError: (title: string, description: string) => void;
}

export const StaffOnboarding: React.FC<AiStaffOnboardingProps> = ({ onBack, onComplete, onError }) => {
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
  const { user } = useAuth();

  // Audio constants
  const SEND_SAMPLE_RATE = 16000;
  const PLAYBACK_SAMPLE_RATE = 24000;
  const WS_URL = 'ws://localhost:8765/onboarding/onboard';

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
      ws.current.send(JSON.stringify({ type: 'start_user_turn', userType: 'staff' }));
    } catch (error) {
      console.error('Error starting recording:', error);
      onError("Microphone Error", "Could not access microphone. Please grant permission.");
      setAiStatus('Idle');
    }
  }, [isRecording, interruptPlayback, onError, downsampleBuffer, toPcm16]);

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
    ws.current.send(JSON.stringify({ type: 'text', content: inputMessage, userType: 'staff' }));
    setInputMessage('');
  }, [inputMessage, interruptPlayback]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-submit when we have enough data
  useEffect(() => {
    if (collectedData.name && collectedData.role && user) {
      handleSubmit(collectedData);
    }
  }, [collectedData, user]);

  const handleSubmit = async (data: any) => {
    try {
      if (!user) {
        onError("Authentication Error", "User not authenticated.");
        return;
      }

      // First, we need to get or create a vendor_staff entry for this user
      let { data: vendorStaff, error: staffError } = await supabase
        .from('vendor_staff')
        .select('*')
        .eq('supabase_auth_uid', user.id)
        .single();

      if (staffError && staffError.code === 'PGRST116') {
        // No vendor_staff entry exists, create a personal vendor first
        const { data: personalVendor, error: vendorError } = await supabase
          .from('vendors')
          .insert({
            supabase_auth_uid: user.id,
            vendor_name: `${data.name || 'Staff'} Services`,
            vendor_category: 'Staff Services',
            contact_email: user.email || '',
            description: `Personal services by ${data.name || 'staff member'}`,
            details: {
              status: 'active',
              is_personal_staff_vendor: true
            }
          })
          .select()
          .single();

        if (vendorError) {
          throw new Error(`Failed to create personal vendor: ${vendorError.message}`);
        }

        // Now create vendor_staff entry with the vendor_id
        const { data: newStaff, error: createError } = await supabase
          .from('vendor_staff')
          .insert({
            supabase_auth_uid: user.id,
            vendor_id: personalVendor.vendor_id,
            email: user.email || '',
            display_name: data.name || '',
            role: data.role || 'staff',
            phone_number: ''
          })
          .select()
          .single();

        if (createError) {
          throw new Error(`Failed to create vendor staff entry: ${createError.message}`);
        }
        vendorStaff = newStaff;
      } else if (staffError) {
        throw new Error(`Failed to get vendor staff entry: ${staffError.message}`);
      }

      // Create a placeholder vendor for the staff member if they don't belong to one
      let vendorId = vendorStaff.vendor_id;
      if (!vendorId) {
        // Create a personal vendor entry for this staff member
        const { data: personalVendor, error: vendorError } = await supabase
          .from('vendors')
          .insert({
            supabase_auth_uid: user.id,
            vendor_name: `${data.name || 'Staff'} Services`,
            vendor_category: 'Staff Services',
            contact_email: user.email || '',
            description: `Personal services by ${data.name || 'staff member'}`,
            details: {
              status: 'active',
              is_personal_staff_vendor: true
            }
          })
          .select()
          .single();

        if (vendorError) {
          throw new Error(`Failed to create personal vendor: ${vendorError.message}`);
        }

        vendorId = personalVendor.vendor_id;

        // Update the vendor_staff entry with the vendor_id
        const { error: updateError } = await supabase
          .from('vendor_staff')
          .update({ vendor_id: vendorId })
          .eq('staff_id', vendorStaff.staff_id);

        if (updateError) {
          console.warn('Failed to update vendor_staff with vendor_id:', updateError);
        }
      }

      // Create staff portfolio entry
      const { data: portfolio, error: portfolioError } = await supabase
        .from('staff_portfolios')
        .insert({
          staff_id: vendorStaff.staff_id,
          vendor_id: vendorId,
          portfolio_type: data.portfolioType || 'individual',
          title: data.portfolioTitle || `${data.name || 'Staff'} Portfolio`,
          description: data.portfolioDescription || '',
          generic_attributes: {
            name: data.name,
            role: data.role,
            food_options: data.food_options,
            pricing_details: data.pricing_details,
            service_type: data.service_type
          }
        })
        .select()
        .single();

      if (portfolioError) {
        throw new Error(`Failed to create staff portfolio: ${portfolioError.message}`);
      }

      toast({
        title: "Staff Onboarding Completed!",
        description: "Your portfolio has been successfully created with SanskaraAi.",
        variant: "default",
      });

      onComplete({ portfolioId: portfolio?.portfolio_id });
    } catch (error: any) {
      console.error('Error submitting staff onboarding:', error);
      onError("Submission Error", error.message || "Failed to complete staff onboarding.");
    }
  };

  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const isBusy = isRecording || isPlaying;

  return (
    <Card className="flex flex-col h-full p-4">
      <div className="flex items-center mb-4">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold mx-auto">AI Staff Onboarding Assistant</h2>
      </div>

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
        <input
          type="text"
          placeholder={isReadyForInput ? "Type your message or speak..." : "Connecting to AI..."}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-grow p-2 border border-gray-300 rounded-md"
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
