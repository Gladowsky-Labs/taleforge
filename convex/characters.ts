import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listAllProtagonists = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("characters")
      .filter((q) => q.and(
        q.eq(q.field("isActive"), true),
        q.eq(q.field("isProtagonist"), true)
      ))
      .order("desc")
      .collect();
  },
});

export const listByUniverse = query({
  args: { universeId: v.id("universes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("characters")
      .withIndex("by_universe", (q) => q.eq("universeId", args.universeId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();
  },
});

export const getProtagonists = query({
  args: { universeId: v.id("universes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("characters")
      .withIndex("by_universe_protagonist", (q) => 
        q.eq("universeId", args.universeId).eq("isProtagonist", true)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("characters") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    universeId: v.id("universes"),
    name: v.string(),
    description: v.string(),
    isProtagonist: v.boolean(),
    avatarUrl: v.optional(v.string()),
    personality: v.optional(v.string()),
    backstory: v.optional(v.string()),
    specialAbilities: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("characters", {
      universeId: args.universeId,
      name: args.name,
      description: args.description,
      isProtagonist: args.isProtagonist,
      avatarUrl: args.avatarUrl,
      personality: args.personality,
      backstory: args.backstory,
      specialAbilities: args.specialAbilities,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const listAllCustomByUser = query({
  args: { 
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customCharacters")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const listCustomByUser = query({
  args: { 
    userId: v.id("users"),
    universeId: v.optional(v.id("universes")),
  },
  handler: async (ctx, args) => {
    if (args.universeId) {
      return await ctx.db
        .query("customCharacters")
        .withIndex("by_user_universe", (q) => 
          q.eq("userId", args.userId).eq("universeId", args.universeId!)
        )
        .order("desc")
        .collect();
    } else {
      return await ctx.db
        .query("customCharacters")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .order("desc")
        .collect();
    }
  },
});

export const getCustom = query({
  args: { id: v.id("customCharacters") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listCustomByUserAndCustomUniverse = query({
  args: { 
    userId: v.id("users"),
    customUniverseId: v.id("customUniverses"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customCharacters")
      .withIndex("by_user_custom_universe", (q) => 
        q.eq("userId", args.userId).eq("customUniverseId", args.customUniverseId)
      )
      .order("desc")
      .collect();
  },
});

export const createCustom = mutation({
  args: {
    userId: v.id("users"),
    universeId: v.optional(v.id("universes")),
    customUniverseId: v.optional(v.id("customUniverses")),
    name: v.string(),
    description: v.string(),
    personality: v.optional(v.string()),
    backstory: v.optional(v.string()),
    specialAbilities: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // Ensure either universeId or customUniverseId is provided
    if (!args.universeId && !args.customUniverseId) {
      throw new Error("Either universeId or customUniverseId must be provided");
    }
    
    return await ctx.db.insert("customCharacters", {
      userId: args.userId,
      universeId: args.universeId,
      customUniverseId: args.customUniverseId,
      name: args.name,
      description: args.description,
      personality: args.personality,
      backstory: args.backstory,
      specialAbilities: args.specialAbilities,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateCustom = mutation({
  args: {
    id: v.id("customCharacters"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    personality: v.optional(v.string()),
    backstory: v.optional(v.string()),
    specialAbilities: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const now = Date.now();
    
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: now,
    });
  },
});