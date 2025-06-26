"use client";

import { ReactNode } from "react";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatSettingsSidebar } from "@/components/chat/chat-settings-sidebar";
import { 
  Panel, 
  PanelGroup, 
  PanelResizeHandle 
} from "react-resizable-panels";
import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context";
import { Button } from "@/components/ui/button";
import { PanelLeft, PanelRight } from "lucide-react";

function ChatLayoutContent({ children }: { children: ReactNode }) {
  const {
    leftSidebarOpen,
    rightSidebarOpen,
    leftSidebarSize,
    rightSidebarSize,
    toggleLeftSidebar,
    toggleRightSidebar,
    setLeftSidebarSize,
    setRightSidebarSize,
  } = useSidebar();

  return (
    <div className="h-screen overflow-hidden relative">
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

      <PanelGroup direction="horizontal" className="h-full">
        {/* Left sidebar panel */}
        {leftSidebarOpen && (
          <>
            <Panel
              id="left-sidebar"
              order={1}
              defaultSize={leftSidebarSize}
              minSize={15}
              maxSize={40}
              onResize={setLeftSidebarSize}
              className="hidden md:block"
            >
              <ChatSidebar onToggle={toggleLeftSidebar} />
            </Panel>
            <PanelResizeHandle className="hidden md:block w-1 bg-transparent hover:bg-border/50 transition-colors relative before:absolute before:inset-y-0 before:left-1/2 before:-translate-x-1/2 before:w-3 before:hover:cursor-col-resize" />
          </>
        )}
        
        {/* Main content panel - takes up remaining space */}
        <Panel id="main-content" order={2}>
          <main className="flex flex-col h-full overflow-hidden">
            {children}
          </main>
        </Panel>
        
        {/* Right sidebar panel */}
        {rightSidebarOpen && (
          <>
            <PanelResizeHandle className="hidden lg:block w-1 bg-transparent hover:bg-border/50 transition-colors relative before:absolute before:inset-y-0 before:left-1/2 before:-translate-x-1/2 before:w-3 before:hover:cursor-col-resize" />
            <Panel
              id="right-sidebar"
              order={3}
              defaultSize={rightSidebarSize}
              minSize={15}
              maxSize={40}
              onResize={setRightSidebarSize}
              className="hidden lg:block"
            >
              <ChatSettingsSidebar onToggle={toggleRightSidebar} />
            </Panel>
          </>
        )}
      </PanelGroup>
      
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