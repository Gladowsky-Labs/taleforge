"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Bot, User } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/sidebar-context";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.chatId as Id<"chats">;
  const [input, setInput] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { leftSidebarOpen } = useSidebar();
  
  const chat = useQuery(api.chats.get, { chatId });
  const messages = useQuery(api.messages.list, { chatId });
  const sendMessage = useAction(api.chat.sendMessage);
  const [isSending, setIsSending] = useState(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMessage = input.trim();
    setInput("");
    setIsSending(true);

    // Scroll to bottom when sending a message
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }

    try {
      await sendMessage({
        chatId,
        content: userMessage,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      // Restore the input if sending failed
      setInput(userMessage);
    } finally {
      setIsSending(false);
    }
  };

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Chat not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat header */}
      <div className="border-b border-border/40 p-4 bg-card/50 backdrop-blur-sm flex-shrink-0">
        <h1 className={cn(
          "text-lg font-semibold text-foreground transition-all duration-200",
          !leftSidebarOpen && "md:ml-12" // Shift right when sidebar is closed to make room for toggle button
        )}>
          {chat.title}
        </h1>
      </div>

      {/* Messages area - simplified without nested ScrollArea */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
        <div className="p-4 pb-20 space-y-4 min-h-full">
          {messages?.map((message) => (
            <div
              key={message._id}
              className={cn(
                "flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role !== "user" && (
                <Avatar className="h-8 w-8 border border-border/20">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-3 shadow-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-card border border-border/20 text-card-foreground"
                )}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs mt-2 opacity-60">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
              {message.role === "user" && (
                <Avatar className="h-8 w-8 border border-border/20">
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {messages?.length === 0 && (
            <div className="flex items-center justify-center h-full text-center text-muted-foreground">
              <div className="space-y-2">
                <Bot className="h-12 w-12 mx-auto opacity-20" />
                <p className="text-lg font-medium">Start a conversation</p>
                <p className="text-sm">Send a message to begin chatting</p>
              </div>
            </div>
          )}
          {isSending && (
            <div className="flex gap-3 justify-start animate-in fade-in-0 slide-in-from-bottom-2">
              <Avatar className="h-8 w-8 border border-border/20">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Bot className="h-4 w-4 animate-pulse" />
                </AvatarFallback>
              </Avatar>
              <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-card border border-border/20">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <p className="text-sm text-muted-foreground">AI is thinking...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
        
      {/* Input area - fixed at bottom */}
      <div className="border-t border-border/40 bg-card/80 backdrop-blur-sm p-4 flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-background/50 border-border/40 focus:border-primary/50 rounded-xl"
            disabled={isSending}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isSending}
            className="rounded-xl bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  );
}