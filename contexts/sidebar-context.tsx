"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSidebarState } from "@/hooks/use-sidebar-state";

interface SidebarContextType {
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  leftSidebarSize: number;
  rightSidebarSize: number;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setLeftSidebarSize: (size: number) => void;
  setRightSidebarSize: (size: number) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const sidebarState = useSidebarState();
  
  return (
    <SidebarContext.Provider value={sidebarState}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}