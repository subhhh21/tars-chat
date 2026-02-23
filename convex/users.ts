import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Requirement #1: Store user profiles in Convex.
 */
export const store = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    image: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authentication identity");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (user !== null) {
      return user._id;
    }

    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      image: args.image,
      clerkId: args.clerkId,
    });
  },
});

/**
 * Requirement #2: Show all registered users (excluding yourself).
 */
export const getUsers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const allUsers = await ctx.db.query("users").collect();
    return allUsers.filter((user) => user.clerkId !== identity.subject);
  },
});

/**
 * CURRENT USER QUERY: page.tsx ke 'currentUser' error ko fix karne ke liye.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});