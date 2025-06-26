"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Settings2, Trash2, Edit2, Check, X, PanelRightClose } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface ChatSettingsSidebarProps {
  onToggle?: () => void;
}

export function ChatSettingsSidebar({ onToggle }: ChatSettingsSidebarProps = {}) {
  const params = useParams();
  const chatId = params.chatId as Id<"chats"> | undefined;
  const chat = useQuery(api.chats.get, chatId ? { chatId } : "skip");
  const updateChat = useMutation(api.chats.update);
  const deleteChat = useMutation(api.chats.remove);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  const handleEditStart = () => {
    if (chat) {
      setEditedTitle(chat.title);
      setIsEditing(true);
    }
  };

  const handleEditSave = async () => {
    if (chatId && editedTitle.trim()) {
      await updateChat({ chatId, title: editedTitle.trim() });
      setIsEditing(false);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditedTitle("");
  };

  const handleDelete = async () => {
    if (chatId && confirm("Are you sure you want to delete this chat?")) {
      await deleteChat({ chatId });
      window.location.href = "/chat";
    }
  };

  const SidebarContent = () => (
    <div className="flex h-screen flex-col">
      <div className="flex items-center justify-between p-4 flex-shrink-0">
        <h2 className="text-lg font-semibold">Chat Settings</h2>
        {onToggle && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onToggle}
            className="h-8 w-8"
          >
            <PanelRightClose className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        )}
      </div>
      <Separator className="flex-shrink-0" />
      {chat ? (
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="chat-title">Chat Title</Label>
              {isEditing ? (
                <div className="flex gap-2">
                  <Input
                    id="chat-title"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEditSave();
                      if (e.key === "Escape") handleEditCancel();
                    }}
                  />
                  <Button size="icon" variant="ghost" onClick={handleEditSave}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={handleEditCancel}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-sm">{chat.title}</p>
                  <Button size="icon" variant="ghost" onClick={handleEditStart}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Created</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(chat.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Last Updated</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(chat.updatedAt).toLocaleDateString()}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Danger Zone</Label>
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Chat
              </Button>
            </div>
          </div>
        </ScrollArea>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-muted-foreground text-center">
            Select a chat to view its settings
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-full h-full border-l border-border/40 bg-card/50 backdrop-blur-sm">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="absolute top-4 right-4">
            <Settings2 className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}