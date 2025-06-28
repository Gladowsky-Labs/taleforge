"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CreateUniverseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: Id<"users">;
}

export function CreateUniverseDialog({ open, onOpenChange, userId }: CreateUniverseDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [gameInstructions, setGameInstructions] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const createCustomUniverse = useMutation(api.customUniverses.create);

  const handleCreateUniverse = async () => {
    if (!name.trim() || !description.trim() || !systemPrompt.trim()) return;

    setIsCreating(true);
    try {
      await createCustomUniverse({
        name: name.trim(),
        description: description.trim(),
        systemPrompt: systemPrompt.trim(),
        gameInstructions: gameInstructions.trim() || undefined,
      });

      // Reset form
      setName("");
      setDescription("");
      setSystemPrompt("");
      setGameInstructions("");
      
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create universe:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleCreateUniverse();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Universe</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Universe Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter universe name"
              onKeyDown={handleKeyPress}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your universe"
              rows={3}
              onKeyDown={handleKeyPress}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="systemPrompt">System Prompt *</Label>
            <Textarea
              id="systemPrompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Define the AI's behavior and tone for this universe"
              rows={4}
              onKeyDown={handleKeyPress}
            />
            <p className="text-sm text-muted-foreground">
              This defines how the AI should behave and respond in this universe.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gameInstructions">Game Instructions (Optional)</Label>
            <Textarea
              id="gameInstructions"
              value={gameInstructions}
              onChange={(e) => setGameInstructions(e.target.value)}
              placeholder="Add specific rules or mechanics for this universe"
              rows={4}
              onKeyDown={handleKeyPress}
            />
            <p className="text-sm text-muted-foreground">
              Optional: Add specific rules, mechanics, or instructions for gameplay in this universe.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateUniverse}
            disabled={!name.trim() || !description.trim() || !systemPrompt.trim() || isCreating}
          >
            {isCreating ? "Creating..." : "Create Universe"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}