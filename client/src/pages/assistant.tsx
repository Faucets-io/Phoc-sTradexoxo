
import { useState } from "react";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { useLocation } from "wouter";

export default function Assistant() {
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "bot",
      text: "Hello! I'm your AI trading assistant. How can I help you today?",
      time: "Just now",
    },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;

    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        sender: "user",
        text: message,
        time: "Just now",
      },
    ]);
    setMessage("");

    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "bot",
          text: "I understand you need help. Let me assist you with that.",
          time: "Just now",
        },
      ]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0 flex flex-col">
      <header className="sticky top-0 z-40 bg-card border-b border-border p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/user")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">AI Assistant</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <Card className={`max-w-[80%] ${msg.sender === "user" ? "bg-primary text-primary-foreground" : ""}`}>
                <CardContent className="p-4">
                  <p>{msg.text}</p>
                  <p className={`text-xs mt-2 ${msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {msg.time}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </main>

      <div className="sticky bottom-20 lg:bottom-0 bg-card border-t p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
