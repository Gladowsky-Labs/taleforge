import { ReactNode } from "react";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatSettingsSidebar } from "@/components/chat/chat-settings-sidebar";

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left sidebar for chat management */}
      <div className="flex-shrink-0 h-full">
        <ChatSidebar />
      </div>
      
      {/* Main content area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {children}
      </main>
      
      {/* Right sidebar for chat-specific settings */}
      <div className="flex-shrink-0 h-full">
        <ChatSettingsSidebar />
      </div>
    </div>
  );
}