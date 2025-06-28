"use client";

import { useState } from "react";
import { useMutation, useAction } from "convex/react";
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
import { Wand2 } from "lucide-react";

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
  const [isGenerating, setIsGenerating] = useState(false);

  const createCustomUniverse = useMutation(api.customUniverses.create);
  const generateContent = useAction(api.openai.generateContent);

  const generateAllContent = async () => {
    if (!name.trim()) return;
    
    setIsGenerating(true);
    try {
      // Generate all fields sequentially for better coherence
      const descriptionResult = await generateContent({
        type: 'universe',
        field: 'description',
        prompt: name.trim(),
        context: { name: name || undefined }
      });
      setDescription(descriptionResult.content);

      const systemPromptResult = await generateContent({
        type: 'universe',
        field: 'systemPrompt',
        prompt: name.trim(),
        context: { 
          name: name || undefined,
          description: descriptionResult.content || undefined
        }
      });
      setSystemPrompt(systemPromptResult.content);

      const gameInstructionsResult = await generateContent({
        type: 'universe',
        field: 'gameInstructions',
        prompt: name.trim(),
        context: { 
          name: name || undefined,
          description: descriptionResult.content || undefined,
          systemPrompt: systemPromptResult.content || undefined
        }
      });
      setGameInstructions(gameInstructionsResult.content);

    } catch (error) {
      console.error('Failed to generate AI content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

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
            <div className="flex items-center justify-between">
              <Label htmlFor="name">Universe Name *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!name.trim() || isGenerating}
                onClick={generateAllContent}
                className="h-8 px-3 text-sm"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating All...' : 'Fill All Fields'}
              </Button>
            </div>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter universe name"
              onKeyDown={handleKeyPress}
            />
            <p className="text-sm text-muted-foreground">
              Enter a universe name and click &quot;Fill All Fields&quot; to auto-generate all universe details with AI.
            </p>
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