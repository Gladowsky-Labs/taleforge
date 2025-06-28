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
  handler: async (_, args) => {
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
  handler: async (_, args) => {
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

export const generateContent = action({
  args: {
    type: v.union(v.literal("character"), v.literal("universe")),
    field: v.string(),
    prompt: v.string(),
    context: v.optional(v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      personality: v.optional(v.string()),
      backstory: v.optional(v.string()),
      universe: v.optional(v.string()),
      systemPrompt: v.optional(v.string()),
      gameInstructions: v.optional(v.string()),
    })),
  },
  handler: async (_, args) => {
    const { type, field, prompt, context } = args;
    
    let systemMessage = "";
    let userMessage = "";
    
    if (type === "character") {
      switch (field) {
        case "description":
          systemMessage = "You are a creative writing assistant. Generate a detailed, vivid character description based on the character name provided. Focus on physical appearance, clothing, and notable features. Keep it concise but engaging, around 2-3 sentences.";
          userMessage = `Generate a character description for: ${prompt}`;
          break;
        case "personality":
          systemMessage = "You are a creative writing assistant. Generate a character personality description focusing on traits, quirks, motivations, and behavioral patterns. Keep it concise but insightful, around 2-3 sentences.";
          userMessage = `Generate personality traits for character: ${prompt}`;
          if (context?.description) {
            userMessage += `\nCharacter description: ${context.description}`;
          }
          break;
        case "backstory":
          systemMessage = "You are a creative writing assistant. Generate an interesting backstory for a character, including key life events, origin, and formative experiences. Keep it engaging and around 3-4 sentences.";
          userMessage = `Generate a backstory for character: ${prompt}`;
          if (context?.description) {
            userMessage += `\nDescription: ${context.description}`;
          }
          if (context?.personality) {
            userMessage += `\nPersonality: ${context.personality}`;
          }
          break;
        case "abilities":
          systemMessage = "You are a creative writing assistant. Generate 3-5 special abilities or skills for a character. Each ability should be on a new line and be concise (2-4 words each). Focus on abilities that fit the character's description and personality.";
          userMessage = `Generate special abilities for character: ${prompt}`;
          if (context?.description) {
            userMessage += `\nDescription: ${context.description}`;
          }
          if (context?.personality) {
            userMessage += `\nPersonality: ${context.personality}`;
          }
          break;
      }
    } else if (type === "universe") {
      switch (field) {
        case "description":
          systemMessage = "You are a creative writing assistant. Generate a rich, immersive universe description based on the universe name. Focus on the setting, atmosphere, key features, and what makes this world unique. Keep it engaging, around 3-4 sentences.";
          userMessage = `Generate a universe description for: ${prompt}`;
          break;
        case "systemPrompt":
          systemMessage = "You are an expert at creating AI system prompts for roleplay scenarios. Generate a system prompt that defines how an AI should behave when roleplaying in this universe. Focus on tone, style, knowledge constraints, and behavioral guidelines. Keep it clear and actionable.";
          userMessage = `Generate a system prompt for universe: ${prompt}`;
          if (context?.description) {
            userMessage += `\nUniverse description: ${context.description}`;
          }
          break;
        case "gameInstructions":
          systemMessage = "You are a game design expert. Generate specific game mechanics, rules, or instructions for gameplay in this universe. Focus on how interactions work, what players can do, any special mechanics or constraints. Keep it clear and organized.";
          userMessage = `Generate game instructions for universe: ${prompt}`;
          if (context?.description) {
            userMessage += `\nDescription: ${context.description}`;
          }
          if (context?.systemPrompt) {
            userMessage += `\nSystem prompt: ${context.systemPrompt}`;
          }
          break;
      }
    }

    try {
      const completion = await openai.chat.completions.create({
        model: process.env.RP_MODEL || "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: systemMessage,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        temperature: 0.8,
        max_tokens: 500,
      });

      const content = completion.choices[0]?.message?.content?.trim();
      
      if (!content) {
        throw new Error("No content generated");
      }

      return {
        content,
        model: completion.model,
        usage: completion.usage,
      };
    } catch (error) {
      console.error("Failed to generate content:", error);
      throw new Error("Failed to generate content");
    }
  },
});