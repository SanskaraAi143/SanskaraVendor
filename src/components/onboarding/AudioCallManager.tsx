import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

const AudioCallManager: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [log, setLog] = useState<{ sender: string; message: string }[]>([]);
  const websocket = useRef<WebSocket | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const processor = useRef<ScriptProcessorNode | null>(null);
  const mediaStream = useRef<MediaStream | null>(null);
  const audioQueue = useRef<ArrayBuffer[]>([]);
  const isPlaying = useRef(false);
  const currentSource = useRef<AudioBufferSourceNode | null>(null);

  const SEND_SAMPLE_RATE = 16000;
  const PLAYBACK_SAMPLE_RATE = 24000;
  const WS_URL = 'ws://localhost:8765/vendor/onboard';

  const logMessage = (sender: string, message: string) => {
    setLog(prev => [...prev, { sender, message }]);
  };

  const startOnboarding = async () => {
    logMessage('System', 'Initializing...');
    try {
      mediaStream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (!audioContext.current || audioContext.current.state === 'closed') {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContext.current.state === 'suspended') {
        await audioContext.current.resume();
      }

      websocket.current = new WebSocket(WS_URL);

      websocket.current.onopen = () => {
        logMessage('System', 'Connection established. You can start speaking.');
        setIsRecording(true);
        
        const source = audioContext.current!.createMediaStreamSource(mediaStream.current!);
        processor.current = audioContext.current!.createScriptProcessor(4096, 1, 1);

        source.connect(processor.current);
        processor.current.connect(audioContext.current!.destination);

        processor.current.onaudioprocess = (e) => {
          if (websocket.current?.readyState !== WebSocket.OPEN) return;
          const inputData = e.inputBuffer.getChannelData(0);
          const downsampled = downsampleBuffer(inputData, audioContext.current!.sampleRate, SEND_SAMPLE_RATE);
          const pcm16 = toPcm16(downsampled);
          const base64 = btoa(String.fromCharCode.apply(null, Array.from(pcm16)));
          websocket.current.send(JSON.stringify({ type: 'audio', data: base64 }));
        };
      };

      websocket.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'audio' && message.data) {
          const audioData = _base64ToArrayBuffer(message.data);
          audioQueue.current.push(audioData);
          if (!isPlaying.current) {
            playNextInQueue();
          }
        } else if (message.type === 'text') {
          logMessage('Agent (Transcription)', message.data);
        } else if (message.type === 'interrupted') {
          interruptPlayback();
        }
      };

      websocket.current.onclose = () => {
        logMessage('System', 'Connection closed.');
        stopStreaming();
      };

      websocket.current.onerror = (error) => {
        console.error('WebSocket Error:', error);
        logMessage('System', 'A WebSocket error occurred.');
        stopStreaming();
      };

    } catch (err) {
      console.error('Error starting onboarding:', err);
      logMessage('System', 'Could not start. Please grant microphone permission and try again.');
    }
  };

  const stopOnboarding = () => {
    if (websocket.current) {
      websocket.current.close();
    }
  };

  const playNextInQueue = async () => {
    if (audioQueue.current.length === 0) {
      isPlaying.current = false;
      return;
    }

    isPlaying.current = true;
    const audioData = audioQueue.current.shift();
    if (!audioData) return;

    try {
      if (audioContext.current?.state === 'suspended') {
        await audioContext.current.resume();
      }

      const int16Array = new Int16Array(audioData);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = audioContext.current!.createBuffer(1, float32Array.length, PLAYBACK_SAMPLE_RATE);
      audioBuffer.getChannelData(0).set(float32Array);

      currentSource.current = audioContext.current!.createBufferSource();
      currentSource.current.buffer = audioBuffer;
      currentSource.current.connect(audioContext.current!.destination);
      
      currentSource.current.onended = () => {
        currentSource.current = null;
        playNextInQueue();
      };
      
      currentSource.current.start(0);

    } catch (error) {
      console.error('Error playing audio:', error);
      isPlaying.current = false;
      setTimeout(playNextInQueue, 100);
    }
  }

  const interruptPlayback = () => {
    if (currentSource.current) {
      try {
        currentSource.current.onended = null;
        currentSource.current.stop();
      } catch (e) {
        console.warn("Error stopping current audio source:", e);
      }
      currentSource.current = null;
    }
    audioQueue.current = [];
    isPlaying.current = false;
  }

  const stopStreaming = () => {
    if (mediaStream.current) {
      mediaStream.current.getTracks().forEach(track => track.stop());
      mediaStream.current = null;
    }
    if (processor.current) {
      processor.current.disconnect();
      processor.current = null;
    }
    if (audioContext.current) {
      audioContext.current.close();
      audioContext.current = null;
    }
    interruptPlayback();
    setIsRecording(false);
  }

  const downsampleBuffer = (buffer: Float32Array, inputSampleRate: number, outputSampleRate: number) => {
    if (outputSampleRate === inputSampleRate) {
      return buffer;
    }
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
  }

  const toPcm16 = (input: Float32Array) => {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return new Uint8Array(buffer);
  }
  
  const _base64ToArrayBuffer = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-center mb-4">
        <Button onClick={startOnboarding} disabled={isRecording}>Start Onboarding</Button>
        <Button onClick={stopOnboarding} disabled={!isRecording}>Stop Onboarding</Button>
      </div>
      <div className="w-full h-64 border rounded p-2 overflow-y-auto bg-gray-50">
        {log.map((entry, index) => (
          <div key={index} className="mb-2">
            <span className="font-bold">{`[${entry.sender}]: `}</span>
            <span>{entry.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AudioCallManager;