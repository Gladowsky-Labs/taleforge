import { v } from "convex/values";
import { action } from "./_generated/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
    "X-Title": process.env.SITE_NAME || "TaleForge Chat",
  },
});

export const chat = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
        content: v.string(),
      })
    ),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { messages, model = process.env.RP_MODEL || "openai/gpt-4o-mini" } = args;

    try {
      const completion = await openai.chat.completions.create({
        model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: 0.7,
        max_tokens: 1000,
      });

      const responseContent = completion.choices[0]?.message?.content;
      
      if (!responseContent) {
        throw new Error("No response from LLM");
      }

      return {
        content: responseContent,
        model: completion.model,
        usage: completion.usage,
      };
    } catch (error) {
      console.error("OpenRouter API error:", error);
      throw new Error("Failed to get response from LLM");
    }
  },
});

export const generateChatTitle = action({
  args: {
    firstMessage: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.TITLE_MODEL || "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Generate a very short, concise title (3-5 words) for a chat that starts with the following message. Respond with only the title, no quotes or punctuation.",
          },
          {
            role: "user",
            content: args.firstMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 20,
      });

      const title = completion.choices[0]?.message?.content?.trim();
      
      if (!title) {
        return "New Chat";
      }

      return title;
    } catch (error) {
      console.error("Failed to generate title:", error);
      return "New Chat";
    }
  },
});