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
      // Call the LLM
      const response = await ctx.runAction(api.openai.chat, {
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
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