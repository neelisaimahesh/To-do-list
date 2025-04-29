import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("todos")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const create = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    await ctx.db.insert("todos", {
      text: args.text,
      completed: false,
      userId,
    });
  },
});

export const toggle = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const todo = await ctx.db.get(args.id);
    if (!todo || todo.userId !== userId) throw new Error("Not found");
    
    await ctx.db.patch(args.id, { completed: !todo.completed });
  },
});

export const remove = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const todo = await ctx.db.get(args.id);
    if (!todo || todo.userId !== userId) throw new Error("Not found");
    
    await ctx.db.delete(args.id);
  },
});
