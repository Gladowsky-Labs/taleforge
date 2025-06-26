"use client";

import { ReactNode } from "react";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatSettingsSidebar } from "@/components/chat/chat-settings-sidebar";
import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context";
import { Button } from "@/components/ui/button";
import { PanelLeft, PanelRight } from "lucide-react";
import { cn } from "@/lib/utils";

function ChatLayoutContent({ children }: { children: ReactNode }) {
  const {
    leftSidebarOpen,
    rightSidebarOpen,
    toggleLeftSidebar,
    toggleRightSidebar,
  } = useSidebar();

  return (
    <div className="h-screen overflow-hidden relative flex">
      {/* Toggle buttons - always visible when sidebars are closed */}
      <div className="absolute left-0 right-0 top-0 flex justify-between pointer-events-none p-4 z-20">
        {!leftSidebarOpen && (
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleLeftSidebar}
            className="pointer-events-auto hidden md:flex bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-background/90"
            aria-label="Open chat sidebar"
            title="Open chat sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex-1" />
        {!rightSidebarOpen && (
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleRightSidebar}
            className="pointer-events-auto hidden lg:flex bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-background/90"
            aria-label="Open settings sidebar"
            title="Open settings sidebar"
          >
            <PanelRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Left sidebar with fixed width */}
      <div
        className={cn(
          "hidden md:block h-full border-r bg-background transition-all duration-300 ease-in-out",
          leftSidebarOpen ? "w-60" : "w-0"
        )}
      >
        {leftSidebarOpen && (
          <div className="w-60 h-full">
            <ChatSidebar onToggle={toggleLeftSidebar} />
          </div>
        )}
      </div>
      
      {/* Main content - takes up remaining space */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {children}
      </main>
      
      {/* Right sidebar with fixed width */}
      <div
        className={cn(
          "hidden lg:block h-full border-l bg-background transition-all duration-300 ease-in-out",
          rightSidebarOpen ? "w-100" : "w-0"
        )}
      >
        {rightSidebarOpen && (
          <div className="w-100 h-full">
            <ChatSettingsSidebar onToggle={toggleRightSidebar} />
          </div>
        )}
      </div>
      
      {/* Mobile sidebars remain unchanged */}
      <div className="md:hidden">
        <ChatSidebar />
      </div>
      <div className="lg:hidden">
        <ChatSettingsSidebar />
      </div>
    </div>
  );
}

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <ChatLayoutContent>{children}</ChatLayoutContent>
    </SidebarProvider>
  );
}