import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    systemPrompt: v.string(),
    gameInstructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const customUniverse = await ctx.db.insert("customUniverses", {
      userId,
      name: args.name,
      description: args.description,
      systemPrompt: args.systemPrompt,
      gameInstructions: args.gameInstructions,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return customUniverse;
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const customUniverses = await ctx.db
      .query("customUniverses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return customUniverses;
  },
});

export const listActiveByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const customUniverses = await ctx.db
      .query("customUniverses")
      .withIndex("by_user_active", (q) => 
        q.eq("userId", userId).eq("isActive", true)
      )
      .collect();

    return customUniverses;
  },
});

export const get = query({
  args: { id: v.id("customUniverses") },
  handler: async (ctx, args) => {
    const customUniverse = await ctx.db.get(args.id);
    
    if (!customUniverse) {
      return null;
    }

    const userId = await getAuthUserId(ctx);
    if (!userId || customUniverse.userId !== userId) {
      return null;
    }

    return customUniverse;
  },
});

export const update = mutation({
  args: {
    id: v.id("customUniverses"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    gameInstructions: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    const customUniverse = await ctx.db.get(id);
    if (!customUniverse) {
      throw new Error("Custom universe not found");
    }

    const userId = await getAuthUserId(ctx);
    if (!userId || customUniverse.userId !== userId) {
      throw new Error("Not authorized to update this universe");
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("customUniverses") },
  handler: async (ctx, args) => {
    const customUniverse = await ctx.db.get(args.id);
    if (!customUniverse) {
      throw new Error("Custom universe not found");
    }

    const userId = await getAuthUserId(ctx);
    if (!userId || customUniverse.userId !== userId) {
      throw new Error("Not authorized to delete this universe");
    }

    await ctx.db.delete(args.id);
    return args.id;
  },
});