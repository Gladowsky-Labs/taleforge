"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User, UserPlus, Crown, Sparkles } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface CharacterSelectorProps {
  universeId: Id<"universes">;
  onSelect: (characterId?: Id<"characters">, customCharacterId?: Id<"customCharacters">) => void;
  selectedCharacterId?: Id<"characters">;
  selectedCustomCharacterId?: Id<"customCharacters">;
  userId: Id<"users">;
}

export function CharacterSelector({ 
  universeId, 
  onSelect, 
  selectedCharacterId, 
  selectedCustomCharacterId,
  userId 
}: CharacterSelectorProps) {
  const [showCreateCustom, setShowCreateCustom] = useState(false);
  const [customCharacter, setCustomCharacter] = useState({
    name: "",
    description: "",
    personality: "",
    backstory: "",
    specialAbilities: [] as string[],
  });
  
  const protagonists = useQuery(api.characters.getProtagonists, { universeId });
  const customCharacters = useQuery(api.characters.listCustomByUser, { 
    userId, 
    universeId 
  });
  const createCustomCharacter = useMutation(api.characters.createCustom);

  const handleCreateCustom = async () => {
    if (!customCharacter.name || !customCharacter.description) return;
    
    try {
      const newCharacterId = await createCustomCharacter({
        userId,
        universeId,
        name: customCharacter.name,
        description: customCharacter.description,
        personality: customCharacter.personality || undefined,
        backstory: customCharacter.backstory || undefined,
        specialAbilities: customCharacter.specialAbilities.length > 0 
          ? customCharacter.specialAbilities 
          : undefined,
      });
      
      onSelect(undefined, newCharacterId);
      setShowCreateCustom(false);
      setCustomCharacter({
        name: "",
        description: "",
        personality: "",
        backstory: "",
        specialAbilities: [],
      });
    } catch (error) {
      console.error("Failed to create custom character:", error);
    }
  };

  const handleAbilitiesChange = (value: string) => {
    const abilities = value.split(",").map(s => s.trim()).filter(s => s.length > 0);
    setCustomCharacter(prev => ({ ...prev, specialAbilities: abilities }));
  };

  if (!protagonists && !customCharacters) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <User className="h-6 w-6 text-primary" />
          Choose Your Character
        </h2>
        <p className="text-muted-foreground">
          Play as the original protagonist or create your own character
        </p>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-6">
          
          {/* Protagonist Characters */}
          {protagonists && protagonists.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                Original Protagonists
              </h3>
              <div className="space-y-3">
                {protagonists.map((character) => (
                  <Card 
                    key={character._id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedCharacterId === character._id
                        ? "ring-2 ring-primary border-primary/50"
                        : "hover:border-primary/30"
                    }`}
                    onClick={() => onSelect(character._id, undefined)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <CardTitle className="text-lg mb-2">{character.name}</CardTitle>
                              <Badge variant="secondary">
                                <Crown className="h-3 w-3 mr-1" />
                                Protagonist
                              </Badge>
                            </div>
                            {selectedCharacterId === character._id && (
                              <Badge variant="default" className="shrink-0">
                                Selected
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                              <CardDescription className="text-sm leading-relaxed mb-3">
                                {character.description}
                              </CardDescription>
                              {character.personality && (
                                <p className="text-sm text-muted-foreground">
                                  <strong className="text-foreground">Personality:</strong> {character.personality}
                                </p>
                              )}
                            </div>
                            
                            {character.specialAbilities && character.specialAbilities.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-foreground mb-2">Special Abilities</p>
                                <div className="flex flex-wrap gap-1">
                                  {character.specialAbilities.map((ability, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {ability}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Custom Characters */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Your Custom Characters
              </h3>
              <Dialog open={showCreateCustom} onOpenChange={setShowCreateCustom}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Character
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Custom Character</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Character Name *</Label>
                      <Input
                        id="name"
                        value={customCharacter.name}
                        onChange={(e) => setCustomCharacter(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter character name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={customCharacter.description}
                        onChange={(e) => setCustomCharacter(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your character"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="personality">Personality</Label>
                      <Textarea
                        id="personality"
                        value={customCharacter.personality}
                        onChange={(e) => setCustomCharacter(prev => ({ ...prev, personality: e.target.value }))}
                        placeholder="Character personality traits"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="backstory">Backstory</Label>
                      <Textarea
                        id="backstory"
                        value={customCharacter.backstory}
                        onChange={(e) => setCustomCharacter(prev => ({ ...prev, backstory: e.target.value }))}
                        placeholder="Character background and history"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="abilities">Special Abilities</Label>
                      <Input
                        id="abilities"
                        value={customCharacter.specialAbilities.join(", ")}
                        onChange={(e) => handleAbilitiesChange(e.target.value)}
                        placeholder="Separate with commas"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowCreateCustom(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreateCustom}
                        disabled={!customCharacter.name || !customCharacter.description}
                      >
                        Create Character
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {customCharacters && customCharacters.length > 0 ? (
              <div className="space-y-3">
                {customCharacters.map((character) => (
                  <Card 
                    key={character._id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedCustomCharacterId === character._id
                        ? "ring-2 ring-primary border-primary/50"
                        : "hover:border-primary/30"
                    }`}
                    onClick={() => onSelect(undefined, character._id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <CardTitle className="text-lg mb-2">{character.name}</CardTitle>
                              <Badge variant="secondary">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Custom
                              </Badge>
                            </div>
                            {selectedCustomCharacterId === character._id && (
                              <Badge variant="default" className="shrink-0">
                                Selected
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                              <CardDescription className="text-sm leading-relaxed mb-3">
                                {character.description}
                              </CardDescription>
                              {character.personality && (
                                <p className="text-sm text-muted-foreground">
                                  <strong className="text-foreground">Personality:</strong> {character.personality}
                                </p>
                              )}
                            </div>
                            
                            {character.specialAbilities && character.specialAbilities.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-foreground mb-2">Special Abilities</p>
                                <div className="flex flex-wrap gap-1">
                                  {character.specialAbilities.map((ability, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {ability}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center border-dashed">
                <UserPlus className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No custom characters yet. Create your first character to get started!
                </p>
              </Card>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}