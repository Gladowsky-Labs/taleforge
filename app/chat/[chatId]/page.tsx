"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, User, ArrowUp } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/sidebar-context";

export default function ChatPage() {
  const params = useParams();
  const chatId = params.chatId as Id<"chats">;
  const [input, setInput] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { leftSidebarOpen } = useSidebar();
  
  const chat = useQuery(api.chats.get, { chatId });
  const messages = useQuery(api.messages.list, { chatId });
  const sendMessage = useAction(api.chat.sendMessage);
  const [isSending, setIsSending] = useState(false);

  // Smooth scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // Auto-focus input on load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMessage = input.trim();
    setInput("");
    setIsSending(true);

    // Smooth scroll to bottom when sending a message
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }

    try {
      setError(null);
      await sendMessage({
        chatId,
        content: userMessage,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setError(error instanceof Error ? error.message : "Failed to send message");
      // Restore the input if sending failed
      setInput(userMessage);
    } finally {
      setIsSending(false);
    }
  };

  if (chat === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="space-y-4 text-center animate-in fade-in-0 duration-500">
          <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10 flex items-center justify-center">
            <Bot className="h-6 w-6 text-primary/60 animate-pulse" />
          </div>
          <p className="text-muted-foreground font-medium">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (chat === null) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="space-y-4 text-center animate-in fade-in-0 duration-500">
          <div className="w-12 h-12 mx-auto rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <Bot className="h-6 w-6 text-destructive/60" />
          </div>
          <p className="text-muted-foreground font-medium">Chat not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Premium Background with Animated Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-accent/5 to-primary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.52_0.2_280_/_0.1),transparent_50%)] animate-float" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,oklch(0.62_0.18_290_/_0.08),transparent_50%)]" style={{ animationDelay: '3s' }} />
      
      {/* Chat header with Glass Morphism */}
      <div className="relative z-10 glass-strong border-b border-glass-border p-8 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className={cn(
            "text-2xl font-bold text-gradient transition-all duration-500 tracking-tight",
            !leftSidebarOpen && "md:ml-12"
          )}>
            {chat.title}
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gradient-primary animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">Online</span>
          </div>
        </div>
      </div>

      {/* Messages area with premium styling */}
      <div ref={messagesContainerRef} className="relative z-10 flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-8 pb-40 space-y-8 min-h-full relative">
          {messages?.map((message, index) => (
            <div
              key={message._id}
              className={cn(
                "group flex gap-6 animate-message-in hover-lift",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {message.role !== "user" && (
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 hover-glow">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-background animate-pulse" />
                  </div>
                </div>
              )}
              <div className="flex flex-col max-w-[80%] space-y-2">
                <div
                  className={cn(
                    "relative group/message transition-all duration-300",
                    message.role === "user"
                      ? "ml-auto"
                      : ""
                  )}
                >
                  <div
                    className={cn(
                      "px-6 py-5 shadow-lg transition-all duration-300 group-hover:shadow-xl relative overflow-hidden",
                      message.role === "user"
                        ? "bg-gradient-primary text-white rounded-[28px] rounded-br-[12px] hover-glow"
                        : "glass rounded-[28px] rounded-bl-[12px] text-card-foreground hover:bg-card/60"
                    )}
                  >
                    {message.role === "user" && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover/message:opacity-100 transition-opacity duration-300" />
                    )}
                    <p className="text-[16px] leading-relaxed whitespace-pre-wrap font-medium relative z-10">{message.content}</p>
                  </div>
                </div>
                <div className={cn(
                  "flex items-center gap-2 px-2 transition-all duration-200",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}>
                  <p className="text-xs text-muted-foreground/60 font-medium">
                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {message.role === "user" && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                  )}
                </div>
              </div>
              {message.role === "user" && (
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-secondary border border-border/20 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <User className="h-6 w-6 text-foreground/80" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-400 rounded-full border-2 border-background" />
                  </div>
                </div>
              )}
            </div>
          ))}
          {messages?.length === 0 && (
            <div className="flex items-center justify-center h-full text-center relative">
              <div className="space-y-8 animate-in fade-in-0 duration-1000 relative z-10">
                <div className="relative">
                  <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-primary flex items-center justify-center shadow-2xl animate-float hover-glow">
                    <Bot className="h-16 w-16 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center animate-bounce">
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-gradient">Welcome to TaleForge</h2>
                  <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                    Your premium AI companion is ready to assist you. Start a conversation and experience the future of AI interaction.
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
              {/* Floating decoration elements */}
              <div className="absolute top-20 left-20 w-16 h-16 rounded-full bg-gradient-accent/20 animate-float" style={{ animationDelay: '1s' }} />
              <div className="absolute bottom-32 right-16 w-12 h-12 rounded-full bg-gradient-primary/15 animate-float" style={{ animationDelay: '2s' }} />
              <div className="absolute top-1/3 right-1/4 w-8 h-8 rounded-full bg-gradient-secondary/30 animate-float" style={{ animationDelay: '1.5s' }} />
            </div>
          )}
          {isSending && (
            <div className="flex gap-6 justify-start animate-message-in">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg animate-glow">
                    <Bot className="h-6 w-6 text-white animate-pulse" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-background animate-bounce" />
                </div>
              </div>
              <div className="glass rounded-[28px] rounded-bl-[12px] px-6 py-5 shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent animate-pulse" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-gradient-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-gradient-primary rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                    <div className="w-3 h-3 bg-gradient-primary rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                  </div>
                  <p className="text-base font-medium text-muted-foreground">AI is crafting the perfect response...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
        
      {/* Premium Input Area */}
      <div className="relative z-10 glass-strong border-t border-glass-border p-8 flex-shrink-0">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-3xl animate-in fade-in-0 slide-in-from-bottom-4 duration-300 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-destructive flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <p className="text-destructive text-sm font-semibold">{error}</p>
            </div>
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-4xl mx-auto relative"
        >
          <div className="relative group">
            {/* Premium Input Field */}
            <div className={cn(
              "relative transition-all duration-500 ease-out",
              isInputFocused && "transform scale-[1.02]"
            )}>
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder=""
                className={cn(
                  "w-full glass border-2 border-transparent rounded-[32px] py-6 px-8 text-[16px] font-medium transition-all duration-500 resize-none min-h-[64px] max-h-40 focus-premium relative z-20",
                  isInputFocused && "border-primary/30 shadow-2xl",
                  !isInputFocused && "hover:border-primary/20"
                )}
                disabled={isSending}
              />
              
              {/* Floating Label Effect - Fixed pointer events */}
              {!input && !isInputFocused && (
                <div className="absolute inset-y-0 left-0 pointer-events-none flex items-center px-8 z-10">
                  <div className="flex items-center gap-3 text-muted-foreground/50">
                    <div className="w-2 h-2 rounded-full bg-primary/30 animate-pulse" />
                    <span className="text-[16px] font-medium">Ask me anything...</span>
                  </div>
                </div>
              )}
              
              {/* Premium Send Button */}
              <div className={cn(
                "absolute right-3 bottom-3 transition-all duration-300",
                input.trim() ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
              )}>
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!input.trim() || isSending}
                  className="h-12 w-12 rounded-full bg-gradient-primary hover:shadow-2xl transition-all duration-300 hover:scale-110 hover-glow border-0 relative overflow-hidden group/btn"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                  <ArrowUp className="h-5 w-5 text-white relative z-10 transition-transform duration-300 group-hover/btn:-rotate-12" />
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </div>
            
            {/* Input Enhancement Effects */}
            <div className={cn(
              "absolute -inset-1 bg-gradient-primary rounded-[33px] opacity-0 transition-all duration-500 blur-lg pointer-events-none -z-10",
              isInputFocused && "opacity-20"
            )} />
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center justify-center mt-4 gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground/60 font-medium">
              <div className="w-1 h-1 rounded-full bg-primary/40" />
              <span>Press Enter to send</span>
              <div className="w-1 h-1 rounded-full bg-primary/40" />
              <span>Shift + Enter for new line</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}