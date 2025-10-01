import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Paperclip, Send, Mic, Video, VideoOff, MicOff, Phone, Settings, User, Copy, X } from 'lucide-react';

// Simulated WebSocket class for development
class MockWebSocket {
  constructor(url: string) {
    console.log(`Mock WebSocket connecting to ${url}`);
    setTimeout(() => {
      this.onopen?.();
    }, 500);
  }

  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((error: any) => void) | null = null;

  send(data: string) {
    console.log('Mock WebSocket sending:', data);
    const message = JSON.parse(data);

    // Simulate AI response
    setTimeout(() => {
      const response = {
        type: 'text',
        data: `This is a simulated response to "${message.text}".`,
      };
      this.onmessage?.({ data: JSON.stringify(response) });
    }, 1000);

    // Simulate completion and JSON data
    if (message.text.toLowerCase().includes("finish")) {
      setTimeout(() => {
        const response = {
          type: 'json',
          data: {
            "venueName": "AI-Filled Venue",
            "fullAddress": "123 AI Lane, Tech City",
          }
        };
        this.onmessage?.({ data: JSON.stringify(response) });
      }, 2000);
    }
  }

  close() {
    console.log('Mock WebSocket closing');
    setTimeout(() => {
      this.onclose?.();
    }, 200);
  }
}


interface AiOnboardingChatProps {
  userType: 'vendor' | 'staff';
  onOnboardingComplete: (data: any) => void;
}

const AiOnboardingChat: React.FC<AiOnboardingChatProps> = ({ userType, onOnboardingComplete }) => {
  const [messages, setMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const ws = useRef<MockWebSocket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Connect to the WebSocket server
    ws.current = new MockWebSocket(`ws://localhost:8000/onboarding/onboard?user_type=${userType}`);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      // Send an initial message
      const initialMessage = {
        type: 'text',
        text: `Start onboarding for ${userType}`,
      };
      ws.current?.send(JSON.stringify(initialMessage));
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'text') {
        setMessages((prev) => [...prev, { sender: 'ai', text: message.data }]);
      } else if (message.type === 'json') {
        // For now, just log the received JSON data
        console.log('Received JSON data:', message.data);
        onOnboardingComplete(message.data);
      }
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.current?.close();
    };
  }, [userType, onOnboardingComplete]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const message = {
        type: 'text',
        text: inputValue,
      };
      ws.current?.send(JSON.stringify(message));
      setMessages((prev) => [...prev, { sender: 'user', text: inputValue }]);
      setInputValue('');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }

    setMessages((prev) => [...prev, { sender: 'user', text: `Uploading ${files.length} file(s)...` }]);

    // Simulate file upload and extraction
    try {
      const response = await fetch('/api/vendor_onboarding/upload-and-extract', {
        method: 'POST',
        body: formData,
      });
      const extractedData = await response.json();

      // For now, just log the extracted data and inform the user.
      console.log('Extracted data:', extractedData);
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Files processed. I have extracted the relevant information.' }]);

      // Here you would merge this data with the conversational data
      // For now, we'll just pass it to the parent
      onOnboardingComplete(extractedData);

    } catch (error) {
      console.error('Error uploading files:', error);
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Sorry, I had trouble processing your files.' }]);
    }
  };


  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
        <div className="relative w-48 h-48 mb-4">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-yellow-400 rounded-full animate-pulse delay-500"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-yellow-400 rounded-full animate-pulse delay-1000"></div>
        </div>
        <h1 className="text-3xl font-medium text-gray-800 mb-2">Sanskara AI</h1>
        <p className="text-gray-500">Onboarding Assistant</p>
      </div>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg transition-transform duration-500 ${
          isChatOpen ? 'translate-y-0' : 'translate-y-[calc(100%-4rem)]'
        }`}
      >
        <div className="flex justify-center p-2 cursor-pointer" onClick={() => setIsChatOpen(!isChatOpen)}>
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-lg">Conversation</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(false)}><X className="h-5 w-5" /></Button>
        </div>
        <div className="h-80 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center space-x-2">
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={handleFileUpload}
          />
          <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            type="text"
            placeholder="Type your message..."
            className="flex-grow"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button type="submit" size="icon">
            <Send className="h-5 w-5" />
          </Button>
          <Button type="button" variant={isRecording ? 'destructive' : 'outline'} size="icon" onClick={() => setIsRecording(!isRecording)}>
            <Mic className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AiOnboardingChat;