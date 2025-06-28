import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export const sendMessage = action({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean; response?: string; error?: string }> => {
    // Get chat details including universe and character
    const chat = await ctx.runQuery(api.chats.get, {
      chatId: args.chatId,
    });

    if (!chat) {
      return { success: false, error: "Chat not found" };
    }

    // First, save the user message
    await ctx.runMutation(api.messages.send, {
      chatId: args.chatId,
      content: args.content,
      role: "user",
    });

    // Get all messages for context
    const messages = await ctx.runQuery(api.messages.list, {
      chatId: args.chatId,
    }) as Array<{
      _id: Id<"messages">;
      _creationTime: number;
      chatId: Id<"chats">;
      userId: Id<"users">;
      content: string;
      role: "user" | "assistant" | "system";
      createdAt: number;
    }>;

    try {
      // Build context with universe and character information
      let systemPrompt = "";
      
      // Handle regular universes
      if (chat.universeId) {
        const universe = await ctx.runQuery(api.universes.get, {
          id: chat.universeId,
        });
        
        if (universe) {
          systemPrompt += universe.systemPrompt;
          
          if (universe.gameInstructions) {
            systemPrompt += "\n\n" + universe.gameInstructions;
          }
        }
      }
      // Handle custom universes
      else if (chat.customUniverseId) {
        const customUniverse = await ctx.runQuery(api.customUniverses.get, {
          id: chat.customUniverseId,
        });
        
        if (customUniverse) {
          systemPrompt += customUniverse.systemPrompt;
          
          if (customUniverse.gameInstructions) {
            systemPrompt += "\n\n" + customUniverse.gameInstructions;
          }
        }
      }
      
      // Add character context and narrative instructions
      if (systemPrompt) {
        systemPrompt += `\n\n--- NARRATIVE INSTRUCTIONS ---
You are an expert storyteller and game master. Your role is to narrate an immersive interactive story where the user embodies their chosen character. Follow these guidelines:

1. NARRATIVE STYLE: Write in third person, describing scenes, environments, other characters, and events happening around the user's character.

2. USER IS THE CHARACTER: The user's messages represent their character speaking and acting. Respond to their actions and dialogue as if they ARE their character.

3. STORY PROGRESSION: Continuously advance the plot, introduce interesting scenarios, conflicts, and opportunities for character development.

4. PROVIDE CHOICES: End most responses with 2-4 specific action options the character could take next, formatted as numbered choices.

5. IMMERSIVE DESCRIPTIONS: Use vivid, sensory details to bring the world to life - sights, sounds, smells, atmosphere.

6. RESPOND TO CHARACTER ACTIONS: When the user speaks or acts as their character, describe the immediate consequences and reactions from the world around them.`;
      }
      
      // Add character context (works for both regular and custom universes)
      if (chat.characterId) {
        const character = await ctx.runQuery(api.characters.get, {
          id: chat.characterId,
        });
        
        if (character) {
          systemPrompt += `\n\n--- CHARACTER DETAILS ---
The user is embodying: ${character.name}
Description: ${character.description}`;
          
          if (character.personality) {
            systemPrompt += `\nPersonality: ${character.personality}`;
          }
          
          if (character.backstory) {
            systemPrompt += `\nBackstory: ${character.backstory}`;
          }
          
          if (character.specialAbilities?.length) {
            systemPrompt += `\nSpecial abilities: ${character.specialAbilities.join(", ")}`;
          }
          
          systemPrompt += `\n\nRemember: When the user speaks, they are speaking AS ${character.name}. When they describe actions, they are acting AS ${character.name}. Respond accordingly by describing how the world reacts to ${character.name}'s words and actions.`;
        }
      } else if (chat.customCharacterId) {
        const customCharacter = await ctx.runQuery(api.characters.getCustom, {
          id: chat.customCharacterId,
        });
        
        if (customCharacter) {
          systemPrompt += `\n\n--- CHARACTER DETAILS ---
The user is embodying their custom character: ${customCharacter.name}
Description: ${customCharacter.description}`;
          
          if (customCharacter.personality) {
            systemPrompt += `\nPersonality: ${customCharacter.personality}`;
          }
          
          if (customCharacter.backstory) {
            systemPrompt += `\nBackstory: ${customCharacter.backstory}`;
          }
          
          if (customCharacter.specialAbilities?.length) {
            systemPrompt += `\nSpecial abilities: ${customCharacter.specialAbilities.join(", ")}`;
          }
          
          systemPrompt += `\n\nRemember: When the user speaks, they are speaking AS ${customCharacter.name}. When they describe actions, they are acting AS ${customCharacter.name}. Respond accordingly by describing how the world reacts to ${customCharacter.name}'s words and actions.`;
        }
      }

      // Prepare messages with system prompt
      const conversationMessages: Array<{role: "user" | "assistant" | "system", content: string}> = [];
      
      if (systemPrompt) {
        conversationMessages.push({
          role: "system",
          content: systemPrompt,
        });
      }
      
      conversationMessages.push(...messages.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      })));

      // Call the LLM
      const response = await ctx.runAction(api.openai.chat, {
        messages: conversationMessages,
      }) as { content: string; model: string; usage?: any };

      // Save assistant message
      await ctx.runMutation(api.messages.send, {
        chatId: args.chatId,
        content: response.content,
        role: "assistant",
        model: response.model,
      });

      // Update chat title if it's the first message
      if (messages.length === 1) {
        const newTitle = await ctx.runAction(api.openai.generateChatTitle, {
          firstMessage: args.content,
        });
        await ctx.runMutation(api.chats.update, {
          chatId: args.chatId,
          title: newTitle,
        });
      }

      return { success: true, response: response.content };
    } catch (error) {
      console.error("Failed to get LLM response:", error);
      
      // Save error message
      await ctx.runMutation(api.messages.send, {
        chatId: args.chatId,
        content: "I apologize, but I encountered an error while processing your request. Please try again.",
        role: "assistant",
      });
      
      return { success: false, error: "Failed to get response" };
    }
  },
});