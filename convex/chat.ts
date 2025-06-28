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
      
      if (chat.universeId) {
        const universe = await ctx.runQuery(api.universes.get, {
          id: chat.universeId,
        });
        
        if (universe) {
          systemPrompt += universe.systemPrompt;
          
          if (universe.gameInstructions) {
            systemPrompt += "\n\n" + universe.gameInstructions;
          }
          
          // Add character context
          if (chat.characterId) {
            const character = await ctx.runQuery(api.characters.get, {
              id: chat.characterId,
            });
            
            if (character) {
              systemPrompt += `\n\nThe player is playing as: ${character.name}`;
              systemPrompt += `\nCharacter description: ${character.description}`;
              
              if (character.personality) {
                systemPrompt += `\nPersonality: ${character.personality}`;
              }
              
              if (character.backstory) {
                systemPrompt += `\nBackstory: ${character.backstory}`;
              }
              
              if (character.specialAbilities?.length) {
                systemPrompt += `\nSpecial abilities: ${character.specialAbilities.join(", ")}`;
              }
            }
          } else if (chat.customCharacterId) {
            const customCharacter = await ctx.runQuery(api.characters.getCustom, {
              id: chat.customCharacterId,
            });
            
            if (customCharacter) {
              systemPrompt += `\n\nThe player is playing as their custom character: ${customCharacter.name}`;
              systemPrompt += `\nCharacter description: ${customCharacter.description}`;
              
              if (customCharacter.personality) {
                systemPrompt += `\nPersonality: ${customCharacter.personality}`;
              }
              
              if (customCharacter.backstory) {
                systemPrompt += `\nBackstory: ${customCharacter.backstory}`;
              }
              
              if (customCharacter.specialAbilities?.length) {
                systemPrompt += `\nSpecial abilities: ${customCharacter.specialAbilities.join(", ")}`;
              }
            }
          }
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