import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Requirement #3: Send a message.
 */
export const send = mutation({
  args: {
    body: v.string(),
    senderId: v.id("users"),
    conversationId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.db.insert("messages", {
      body: args.body,
      senderId: args.senderId,
      conversationId: args.conversationId,
      isDeleted: false, // Default false
    });
  },
});

/**
 * Requirement #3: List messages.
 */
export const list = query({
  args: { conversationId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();
  },
});

/**
 * Requirement #11: Soft Delete own message.
 */
export const remove = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    // Check if user is the sender (security)
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || message.senderId !== user._id) {
      throw new Error("Unauthorized to delete this message");
    }

    // Soft delete: update flag, don't delete record
    return await ctx.db.patch(args.messageId, { isDeleted: true });
  },
});