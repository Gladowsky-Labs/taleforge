"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface CreateCharacterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: Id<"users">;
}

export function CreateCharacterDialog({ open, onOpenChange, userId }: CreateCharacterDialogProps) {
  const [selectedUniverseId, setSelectedUniverseId] = useState<Id<"universes"> | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [personality, setPersonality] = useState("");
  const [backstory, setBackstory] = useState("");
  const [specialAbilities, setSpecialAbilities] = useState<string[]>([]);
  const [newAbility, setNewAbility] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const universes = useQuery(api.universes.list);
  const createCustomCharacter = useMutation(api.characters.createCustom);

  const handleAddAbility = () => {
    if (newAbility.trim() && !specialAbilities.includes(newAbility.trim())) {
      setSpecialAbilities([...specialAbilities, newAbility.trim()]);
      setNewAbility("");
    }
  };

  const handleRemoveAbility = (ability: string) => {
    setSpecialAbilities(specialAbilities.filter(a => a !== ability));
  };

  const handleCreateCharacter = async () => {
    if (!name.trim() || !description.trim()) return;

    setIsCreating(true);
    try {
      await createCustomCharacter({
        userId,
        universeId: selectedUniverseId || undefined,
        customUniverseId: undefined, // Not setting custom universe from this dialog
        name: name.trim(),
        description: description.trim(),
        personality: personality.trim() || undefined,
        backstory: backstory.trim() || undefined,
        specialAbilities: specialAbilities.length > 0 ? specialAbilities : undefined,
      });

      // Reset form
      setName("");
      setDescription("");
      setPersonality("");
      setBackstory("");
      setSpecialAbilities([]);
      setNewAbility("");
      setSelectedUniverseId(null);
      
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create character:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleCreateCharacter();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Character</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="universe">Universe (Optional)</Label>
            <Select value={selectedUniverseId || ""} onValueChange={(value) => setSelectedUniverseId(value === "none" ? null : value as Id<"universes">)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a universe (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No specific universe</SelectItem>
                {universes?.map((universe) => (
                  <SelectItem key={universe._id} value={universe._id}>
                    {universe.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Leave blank to create a character that can be used in any universe.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Character Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter character name"
              onKeyDown={handleKeyPress}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your character"
              rows={3}
              onKeyDown={handleKeyPress}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personality">Personality</Label>
            <Textarea
              id="personality"
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              placeholder="Describe their personality traits"
              rows={2}
              onKeyDown={handleKeyPress}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="backstory">Backstory</Label>
            <Textarea
              id="backstory"
              value={backstory}
              onChange={(e) => setBackstory(e.target.value)}
              placeholder="Tell their story"
              rows={3}
              onKeyDown={handleKeyPress}
            />
          </div>

          <div className="space-y-2">
            <Label>Special Abilities</Label>
            <div className="flex gap-2">
              <Input
                value={newAbility}
                onChange={(e) => setNewAbility(e.target.value)}
                placeholder="Add a special ability"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAbility();
                  } else {
                    handleKeyPress(e);
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddAbility}>
                Add
              </Button>
            </div>
            {specialAbilities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {specialAbilities.map((ability) => (
                  <Badge key={ability} variant="secondary" className="flex items-center gap-1">
                    {ability}
                    <X
                      className="h-3 w-3 cursor-pointer hover:bg-destructive/20 rounded-full"
                      onClick={() => handleRemoveAbility(ability)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateCharacter}
            disabled={!name.trim() || !description.trim() || isCreating}
          >
            {isCreating ? "Creating..." : "Create Character"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}