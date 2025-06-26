"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UniverseSelector } from "./universe-selector";
import { CharacterSelector } from "./character-selector";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Rocket } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface CreateUniverseChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: Id<"users">;
}

type Step = "universe" | "character" | "confirm";

export function CreateUniverseChatDialog({ 
  open, 
  onOpenChange, 
  userId 
}: CreateUniverseChatDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("universe");
  const [selectedUniverseId, setSelectedUniverseId] = useState<Id<"universes">>();
  const [selectedCharacterId, setSelectedCharacterId] = useState<Id<"characters">>();
  const [selectedCustomCharacterId, setSelectedCustomCharacterId] = useState<Id<"customCharacters">>();
  const [isCreating, setIsCreating] = useState(false);
  
  const createChat = useMutation(api.chats.create);

  const handleUniverseSelect = (universeId: Id<"universes">) => {
    setSelectedUniverseId(universeId);
    // Reset character selection when universe changes
    setSelectedCharacterId(undefined);
    setSelectedCustomCharacterId(undefined);
  };

  const handleCharacterSelect = (
    characterId?: Id<"characters">, 
    customCharacterId?: Id<"customCharacters">
  ) => {
    setSelectedCharacterId(characterId);
    setSelectedCustomCharacterId(customCharacterId);
  };

  const handleNext = () => {
    if (step === "universe" && selectedUniverseId) {
      setStep("character");
    } else if (step === "character" && (selectedCharacterId || selectedCustomCharacterId)) {
      setStep("confirm");
    }
  };

  const handleBack = () => {
    if (step === "character") {
      setStep("universe");
    } else if (step === "confirm") {
      setStep("character");
    }
  };

  const handleCreateChat = async () => {
    if (!selectedUniverseId) return;
    
    setIsCreating(true);
    try {
      const chatId = await createChat({
        title: "New Adventure", // Will be auto-generated from first message
        universeId: selectedUniverseId,
        characterId: selectedCharacterId,
        customCharacterId: selectedCustomCharacterId,
      });
      
      onOpenChange(false);
      router.push(`/chat/${chatId}`);
      
      // Reset state
      setStep("universe");
      setSelectedUniverseId(undefined);
      setSelectedCharacterId(undefined);
      setSelectedCustomCharacterId(undefined);
    } catch (error) {
      console.error("Failed to create chat:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case "universe":
        return !!selectedUniverseId;
      case "character":
        return !!(selectedCharacterId || selectedCustomCharacterId);
      case "confirm":
        return true;
      default:
        return false;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case "universe":
        return "Choose Universe";
      case "character":
        return "Choose Character";
      case "confirm":
        return "Ready to Adventure";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl">{getStepTitle()}</DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={step === "universe" ? "default" : "secondary"} className="text-xs">
              1. Universe
            </Badge>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <Badge variant={step === "character" ? "default" : "secondary"} className="text-xs">
              2. Character
            </Badge>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <Badge variant={step === "confirm" ? "default" : "secondary"} className="text-xs">
              3. Start
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {step === "universe" && (
            <UniverseSelector 
              onSelect={handleUniverseSelect}
              selectedUniverseId={selectedUniverseId}
            />
          )}
          
          {step === "character" && selectedUniverseId && (
            <CharacterSelector
              universeId={selectedUniverseId}
              onSelect={handleCharacterSelect}
              selectedCharacterId={selectedCharacterId}
              selectedCustomCharacterId={selectedCustomCharacterId}
              userId={userId}
            />
          )}
          
          {step === "confirm" && (
            <div className="text-center py-8 space-y-6">
              <Rocket className="h-16 w-16 text-primary mx-auto" />
              <div>
                <h3 className="text-2xl font-bold mb-4">Ready to Begin Your Adventure!</h3>
                <div className="bg-muted rounded-lg p-4 space-y-2 text-left max-w-md mx-auto">
                  <div className="flex justify-between">
                    <span className="font-medium">Universe:</span>
                    <Badge variant="outline">Selected</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Character:</span>
                    <Badge variant="outline">
                      {selectedCharacterId ? "Protagonist" : "Custom"}
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground">
                Your adventure is ready to begin. Click "Start Adventure" to create your chat and start playing!
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={step === "universe"}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            
            {step === "confirm" ? (
              <Button 
                onClick={handleCreateChat}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Start Adventure
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}