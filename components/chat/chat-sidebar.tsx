"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MessageSquare, Settings, LogOut, ChevronDown, PanelLeftClose, X } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, useParams } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface ChatSidebarProps {
  onToggle?: () => void;
}

export function ChatSidebar({ onToggle }: ChatSidebarProps = {}) {
  const router = useRouter();
  const params = useParams();
  const { signOut } = useAuthActions();
  const chats = useQuery(api.chats.list);
  const createChat = useMutation(api.chats.create);
  const deleteChat = useMutation(api.chats.remove);
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);

  const handleCreateChat = async () => {
    const chatId = await createChat({ title: "New Chat" });
    router.push(`/chat/${chatId}`);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/signin");
  };

  const handleDeleteChat = async (chatId: Id<"chats">, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteChat({ chatId });
    
    // If we're deleting the currently viewed chat, redirect to home
    if (params.chatId === chatId) {
      router.push("/chat");
    }
  };

  const SidebarContent = () => (
    <div className="flex h-screen flex-col">
      <div className="flex items-center justify-between p-4 flex-shrink-0">
        <h2 className="text-lg font-semibold">Chats</h2>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCreateChat}
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">New chat</span>
          </Button>
          {onToggle && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onToggle}
              className="h-8 w-8"
            >
              <PanelLeftClose className="h-4 w-4" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          )}
        </div>
      </div>
      <Separator className="flex-shrink-0" />
      <ScrollArea className="flex-1 min-h-0">
        <div className="space-y-2 p-2">
            {chats?.map((chat) => (
              <div
                key={chat._id}
                className="relative group"
                onMouseEnter={() => setHoveredChatId(chat._id)}
                onMouseLeave={() => setHoveredChatId(null)}
              >
                <Button
                  variant={params.chatId === chat._id ? "secondary" : "ghost"}
                  className="w-full justify-start pr-8"
                  onClick={() => {
                    router.push(`/chat/${chat._id}`);
                  }}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span className="truncate">{chat.title}</span>
                </Button>
                {hoveredChatId === chat._id && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDeleteChat(chat._id, e)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Delete chat</span>
                  </Button>
                )}
              </div>
            ))}
            {chats?.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                No chats yet. Create one to get started!
              </div>
            )}
          </div>
        </ScrollArea>
        <Separator className="flex-shrink-0" />
        <div className="p-4 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start p-2 h-auto hover:bg-accent"
              >
                <div className="flex items-center gap-3 w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">User</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-full h-full border-r border-border/40 bg-card/50 backdrop-blur-sm">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="absolute top-4 left-4">
            <MessageSquare className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}