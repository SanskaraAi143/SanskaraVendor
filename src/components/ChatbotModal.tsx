
import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatbotModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

type Message = {
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
};

const INITIAL_MESSAGES: Message[] = [
  {
    content: "Hi there! I'm your wedding wisdom assistant. How can I help you with your wedding plans today?",
    sender: "bot",
    timestamp: new Date(),
  },
];

const ChatbotModal = ({ open, setOpen }: ChatbotModalProps) => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (input.trim() === "") return;

    // Add user message
    const userMessage: Message = {
      content: input,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponses: { [key: string]: string } = {
        "wedding": "A wedding is a ceremony where two people are united in marriage. Wedding traditions and customs vary greatly between cultures, ethnic groups, religions, countries, and social classes.",
        "venue": "When choosing a wedding venue, consider your budget, guest count, location convenience, and whether it matches your wedding vision. Visit multiple venues before making a decision.",
        "budget": "Creating a wedding budget is essential. Start by determining your total available funds, then allocate percentages to different categories like venue, catering, attire, etc. Always include a buffer of 10-15% for unexpected expenses.",
        "traditions": "Wedding traditions vary across cultures. Some common ones include something old, new, borrowed and blue; the first dance; cutting the cake together; and tossing the bouquet.",
        "dress": "When shopping for a wedding dress, start 9-12 months before the wedding. Consider your venue, the season, and your personal style. Bring a trusted friend or family member, and don't forget to set a budget before shopping.",
      };

      // Find if any keywords are in the input
      const lowerInput = input.toLowerCase();
      let response = "I'm not sure how to help with that specific question. Could you try asking about wedding venues, budgeting, traditions, or dresses?";
      
      Object.keys(botResponses).forEach(key => {
        if (lowerInput.includes(key)) {
          response = botResponses[key];
        }
      });

      const botMessage: Message = {
        content: response,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-wedrose-500" />
            <span>Wedding Wisdom Assistant</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col space-y-4 max-h-[60vh] overflow-y-auto p-4 -mx-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex flex-col space-y-2 text-sm max-w-[80%] rounded-lg p-4",
                message.sender === "user"
                  ? "ml-auto bg-wedrose-100 text-wedrose-900"
                  : "bg-muted"
              )}
            >
              <div>{message.content}</div>
              <div
                className={cn(
                  "text-xs",
                  message.sender === "user"
                    ? "text-wedrose-600"
                    : "text-wedneutral-500"
                )}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex flex-col space-y-2 text-sm max-w-[80%] rounded-lg p-4 bg-muted">
              <div className="flex space-x-2">
                <div className="h-2 w-2 rounded-full bg-wedneutral-400 animate-bounce" />
                <div className="h-2 w-2 rounded-full bg-wedneutral-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="h-2 w-2 rounded-full bg-wedneutral-400 animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <DialogFooter className="flex sm:justify-between">
          <div className="flex items-center w-full gap-2">
            <Input
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="icon"
              onClick={handleSend}
              disabled={loading || input.trim() === ""}
              className="bg-wedrose-500 hover:bg-wedrose-600 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChatbotModal;
