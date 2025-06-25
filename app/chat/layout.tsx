import { ReactNode } from "react";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatSettingsSidebar } from "@/components/chat/chat-settings-sidebar";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left sidebar for chat management */}
      <ChatSidebar />
      
      {/* Main content area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
      
      {/* Right sidebar for chat-specific settings */}
      <ChatSettingsSidebar />
    </div>
  );
}