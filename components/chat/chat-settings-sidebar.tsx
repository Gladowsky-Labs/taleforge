"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings2, Trash2, Edit2, Check, X, PanelRightClose, Globe, User, Info } from "lucide-react";
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
  
  // Fetch related data
  const universe = useQuery(api.universes.get, chat?.universeId ? { id: chat.universeId } : "skip");
  const character = useQuery(api.characters.get, chat?.characterId ? { id: chat.characterId } : "skip");
  const customCharacter = useQuery(api.characters.getCustom, chat?.customCharacterId ? { id: chat.customCharacterId } : "skip");
  const messageCount = useQuery(api.messages.count, chatId ? { chatId } : "skip");
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

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
    <div className="flex h-full flex-col overflow-hidden w-full">
      <div className="flex items-center justify-between p-3 flex-shrink-0 border-b min-w-0">
        <h2 className="text-base font-semibold truncate flex-1 min-w-0">Chat Details</h2>
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
      {chat ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4 p-1 mx-3 mt-3" style={{ width: "calc(100% - 1.5rem)" }}>
            <TabsTrigger value="overview" className="text-xs">
              <Info className="h-3 w-3 mr-1" />
              Info
            </TabsTrigger>
            <TabsTrigger value="universe" className="text-xs" disabled={!chat.universeId}>
              <Globe className="h-3 w-3 mr-1" />
              Universe
            </TabsTrigger>
            <TabsTrigger value="character" className="text-xs" disabled={!chat.characterId && !chat.customCharacterId}>
              <User className="h-3 w-3 mr-1" />
              Character
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              <Settings2 className="h-3 w-3 mr-1" />
              Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-4 w-full">
                <div className="space-y-2 w-full">
                  <Label htmlFor="chat-title" className="text-sm">Chat Title</Label>
                  {isEditing ? (
                    <div className="flex gap-1 w-full">
                      <Input
                        id="chat-title"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleEditSave();
                          if (e.key === "Escape") handleEditCancel();
                        }}
                        className="h-8 text-sm flex-1 min-w-0"
                      />
                      <Button size="icon" variant="ghost" onClick={handleEditSave} className="h-8 w-8">
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={handleEditCancel} className="h-8 w-8">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 w-full min-w-0">
                      <p className="text-sm truncate flex-1 min-w-0">{chat.title}</p>
                      <Button size="icon" variant="ghost" onClick={handleEditStart} className="h-7 w-7 flex-shrink-0">
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-sm">Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(chat.createdAt).toLocaleDateString()} at {new Date(chat.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm">Last Updated</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(chat.updatedAt).toLocaleDateString()} at {new Date(chat.updatedAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm">Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    {messageCount ?? 0} {messageCount === 1 ? "message" : "messages"}
                  </p>
                </div>

                <div className="space-y-1">
                  <Label className="text-sm">AI Model</Label>
                  <p className="text-sm text-muted-foreground">
                    {chat.model || "gpt-4o-mini"}
                  </p>
                </div>

                {chat.universeId && (
                  <div className="space-y-1">
                    <Label className="text-sm">Universe</Label>
                    <p className="text-sm text-muted-foreground">
                      {universe?.name || "Loading..."}
                    </p>
                  </div>
                )}

                {(chat.characterId || chat.customCharacterId) && (
                  <div className="space-y-1">
                    <Label className="text-sm">Character</Label>
                    <p className="text-sm text-muted-foreground">
                      {character?.name || customCharacter?.name || "Loading..."}
                      {chat.customCharacterId && " (Custom)"}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="universe" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              {universe ? (
                <div className="p-3 space-y-4 w-full">
                  <div className="space-y-1">
                    <Label className="text-sm">Universe Name</Label>
                    <p className="text-sm font-medium">{universe.name}</p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm">Description</Label>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {universe.description}
                    </p>
                  </div>

                  {universe.gameInstructions && (
                    <div className="space-y-1">
                      <Label className="text-sm">Game Instructions</Label>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {universe.gameInstructions}
                      </p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label className="text-sm">System Prompt</Label>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap font-mono text-xs bg-muted p-2 rounded">
                      {universe.systemPrompt}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3">
                  <p className="text-sm text-muted-foreground">No universe selected</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="character" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              {character || customCharacter ? (
                <div className="p-3 space-y-4 w-full">
                  <div className="space-y-1">
                    <Label className="text-sm">Character Name</Label>
                    <p className="text-sm font-medium">
                      {character?.name || customCharacter?.name}
                      {customCharacter && " (Custom)"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-sm">Description</Label>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {character?.description || customCharacter?.description}
                    </p>
                  </div>

                  {(character?.personality || customCharacter?.personality) && (
                    <div className="space-y-1">
                      <Label className="text-sm">Personality</Label>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {character?.personality || customCharacter?.personality}
                      </p>
                    </div>
                  )}

                  {(character?.backstory || customCharacter?.backstory) && (
                    <div className="space-y-1">
                      <Label className="text-sm">Backstory</Label>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {character?.backstory || customCharacter?.backstory}
                      </p>
                    </div>
                  )}

                  {(character?.specialAbilities?.length || customCharacter?.specialAbilities?.length) ? (
                    <div className="space-y-1">
                      <Label className="text-sm">Special Abilities</Label>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {(character?.specialAbilities || customCharacter?.specialAbilities || []).map((ability, index) => (
                          <li key={index} className="ml-4 list-disc">
                            {ability}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {character?.isProtagonist && (
                    <div className="space-y-1">
                      <Label className="text-sm">Role</Label>
                      <p className="text-sm text-muted-foreground">Protagonist</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3">
                  <p className="text-sm text-muted-foreground">No character selected</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-4 w-full">
                <div className="space-y-2 w-full">
                  <Label className="text-sm text-destructive">Danger Zone</Label>
                  <Button
                    variant="destructive"
                    className="w-full h-9 text-sm"
                    onClick={handleDelete}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Chat
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-xs text-muted-foreground text-center">
            Select a chat to view its details
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-full h-full border-l bg-sidebar/50 backdrop-blur-sm overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="absolute top-4 right-4">
            <Settings2 className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72 sm:w-80 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}