import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  
  universes: defineTable({
    name: v.string(),
    description: v.string(),
    systemPrompt: v.string(),
    gameInstructions: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_active", ["isActive"]),

  characters: defineTable({
    universeId: v.id("universes"),
    name: v.string(),
    description: v.string(),
    isProtagonist: v.boolean(),
    avatarUrl: v.optional(v.string()),
    personality: v.optional(v.string()),
    backstory: v.optional(v.string()),
    specialAbilities: v.optional(v.array(v.string())),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_universe", ["universeId"])
    .index("by_universe_protagonist", ["universeId", "isProtagonist"]),

  customCharacters: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.string(),
    personality: v.optional(v.string()),
    backstory: v.optional(v.string()),
    specialAbilities: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
    // Updated: removed universeId and customUniverseId fields
  }).index("by_user", ["userId"]),

  customUniverses: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.string(),
    systemPrompt: v.string(),
    gameInstructions: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isActive"]),

  chats: defineTable({
    userId: v.id("users"),
    title: v.string(),
    universeId: v.optional(v.id("universes")),
    customUniverseId: v.optional(v.id("customUniverses")),
    characterId: v.optional(v.id("characters")),
    customCharacterId: v.optional(v.id("customCharacters")),
    createdAt: v.number(),
    updatedAt: v.number(),
    model: v.optional(v.string()),
  }).index("by_user", ["userId"])
    .index("by_universe", ["universeId"])
    .index("by_custom_universe", ["customUniverseId"]),

  messages: defineTable({
    chatId: v.id("chats"),
    userId: v.id("users"),
    content: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    createdAt: v.number(),
    model: v.optional(v.string()),
  }).index("by_chat", ["chatId"]),
});
