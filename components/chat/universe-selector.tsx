"use client";

import React from "react";
import { useQuery } from "convex/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Sparkles, User } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface UniverseSelectorProps {
  onSelect: (universeId: Id<"universes"> | Id<"customUniverses">, isCustom: boolean) => void;
  selectedUniverseId?: Id<"universes"> | Id<"customUniverses">;
  selectedIsCustom?: boolean;
}

export function UniverseSelector({ onSelect, selectedUniverseId, selectedIsCustom = false }: UniverseSelectorProps) {
  const universes = useQuery(api.universes.list);
  const customUniverses = useQuery(api.customUniverses.listActiveByUser) || [];

  if (!universes || !customUniverses) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (universes.length === 0 && customUniverses.length === 0) {
    return (
      <Card className="p-8 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <CardTitle className="text-lg mb-2">No Universes Available</CardTitle>
        <CardDescription>
          No universes are currently available. Create your own universe to get started!
        </CardDescription>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Choose Your Universe
        </h2>
        <p className="text-muted-foreground">
          Select a book universe to begin your adventure
        </p>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="grid gap-4">
          {customUniverses.map((universe) => (
            <Card 
              key={universe._id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedUniverseId === universe._id && selectedIsCustom
                  ? "ring-2 ring-primary border-primary/50"
                  : "hover:border-primary/30"
              }`}
              onClick={() => onSelect(universe._id, true)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{universe.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      <User className="h-3 w-3 mr-1" />
                      My Universe
                    </Badge>
                  </div>
                  {selectedUniverseId === universe._id && selectedIsCustom && (
                    <Badge variant="default" className="shrink-0">
                      Selected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-3">
                  {universe.description}
                </CardDescription>
                <div className="mt-3 flex justify-end">
                  <Button 
                    size="sm" 
                    variant={selectedUniverseId === universe._id && selectedIsCustom ? "default" : "outline"}
                  >
                    {selectedUniverseId === universe._id && selectedIsCustom ? "Selected" : "Choose This Universe"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {universes.map((universe) => (
            <Card 
              key={universe._id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedUniverseId === universe._id && !selectedIsCustom
                  ? "ring-2 ring-primary border-primary/50"
                  : "hover:border-primary/30"
              }`}
              onClick={() => onSelect(universe._id, false)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{universe.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Book Universe
                    </Badge>
                  </div>
                  {selectedUniverseId === universe._id && !selectedIsCustom && (
                    <Badge variant="default" className="shrink-0">
                      Selected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-3">
                  {universe.description}
                </CardDescription>
                <div className="mt-3 flex justify-end">
                  <Button 
                    size="sm" 
                    variant={selectedUniverseId === universe._id && !selectedIsCustom ? "default" : "outline"}
                  >
                    {selectedUniverseId === universe._id && !selectedIsCustom ? "Selected" : "Choose This Universe"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}