"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageSquare, Settings, LogOut, ChevronDown, PanelLeftClose, X, Sparkles, UserPlus } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, useParams } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CreateUniverseChatDialog } from "./create-universe-chat-dialog";
import { CreateCharacterDialog } from "./create-character-dialog";

interface ChatSidebarProps {
  onToggle?: () => void;
}

export function ChatSidebar({ onToggle }: ChatSidebarProps = {}) {
  const router = useRouter();
  const params = useParams();
  const { signOut } = useAuthActions();
  const chats = useQuery(api.chats.list);
  const deleteChat = useMutation(api.chats.remove);
  const [showUniverseDialog, setShowUniverseDialog] = useState(false);
  const [showCharacterDialog, setShowCharacterDialog] = useState(false);
  
  // Get current user ID for universe chat creation
  const currentUser = useQuery(api.users.currentUser);

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
    <div className="flex h-full flex-col overflow-hidden w-full">
      <div className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between p-3 min-w-0">
          <h2 className="text-base font-semibold truncate flex-1 min-w-0">Chats</h2>
          {onToggle && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onToggle}
              className="h-8 w-8 flex-shrink-0"
            >
              <PanelLeftClose className="h-4 w-4" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          )}
        </div>
        <div className="px-3 pb-3 space-y-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => setShowUniverseDialog(true)}
            className="w-full justify-start"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            New Adventure
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCharacterDialog(true)}
            className="w-full justify-start"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            New Character
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2 w-full">
            {chats?.map((chat) => (
              <div
                key={chat._id}
                className="relative group w-full"
              >
                <Button
                  variant={params.chatId === chat._id ? "secondary" : "ghost"}
                  className="w-55 justify-start h-auto py-2 pl-2 pr-8 group relative overflow-hidden"
                  onClick={() => {
                    router.push(`/chat/${chat._id}`);
                  }}
                >
                  <div className="flex items-center w-full min-w-0 overflow-hidden">
                    <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate text-sm text-left min-w-0 block max-w-full">{chat.title}</span>
                  </div>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  onClick={(e) => handleDeleteChat(chat._id, e)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Delete chat</span>
                </Button>
              </div>
            ))}
            {chats?.length === 0 && (
              <div className="text-center text-xs text-muted-foreground py-8 px-2">
                No chats yet. Create one to get started!
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-3 flex-shrink-0 border-t w-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start p-2 h-auto hover:bg-accent"
              >
                <div className="flex items-center gap-2 w-full min-w-0">
                  <Avatar className="h-7 w-7 flex-shrink-0">
                    <AvatarFallback className="text-xs">U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium truncate">User</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[200px]">
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
      <aside className="hidden md:flex w-full h-full border-r bg-sidebar/50 backdrop-blur-sm overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="sm" className="absolute top-4 left-4">
            <MessageSquare className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 sm:w-80 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Universe Chat Dialog */}
      {currentUser?._id && (
        <CreateUniverseChatDialog
          open={showUniverseDialog}
          onOpenChange={setShowUniverseDialog}
          userId={currentUser._id}
        />
      )}

      {/* Character Creation Dialog */}
      {currentUser?._id && (
        <CreateCharacterDialog
          open={showCharacterDialog}
          onOpenChange={setShowCharacterDialog}
          userId={currentUser._id}
        />
      )}
    </>
  );
}