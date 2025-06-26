"use client";

import { useState, useEffect, useCallback } from "react";

interface SidebarState {
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
}

const DEFAULT_STATE: SidebarState = {
  leftSidebarOpen: true,
  rightSidebarOpen: true,
};

const STORAGE_KEY = "taleforge-sidebar-state";

export function useSidebarState() {
  const [state, setState] = useState<SidebarState>(DEFAULT_STATE);

  // Load state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setState(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse sidebar state", e);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const toggleLeftSidebar = useCallback(() => {
    setState((prev) => ({ ...prev, leftSidebarOpen: !prev.leftSidebarOpen }));
  }, []);

  const toggleRightSidebar = useCallback(() => {
    setState((prev) => ({ ...prev, rightSidebarOpen: !prev.rightSidebarOpen }));
  }, []);

  return {
    ...state,
    toggleLeftSidebar,
    toggleRightSidebar,
  };
}