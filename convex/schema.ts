import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.string(),
    clerkId: v.string(),
    // Optional: Online status ke liye (Requirement 7)
    isOnline: v.optional(v.boolean()),
  }).index("by_clerkId", ["clerkId"]),
  
  messages: defineTable({
    body: v.string(),
    senderId: v.id("users"),
    conversationId: v.string(), 
    // Requirement 11: Soft delete ke liye flag
    isDeleted: v.optional(v.boolean()), 
    // Requirement 12: Reactions ke liye (Optional)
    reactions: v.optional(v.array(v.string())), 
  }).index("by_conversationId", ["conversationId"]),

  // Optional Requirement 9: Unread count track karne ke liye
  conversations: defineTable({
    participantOne: v.id("users"),
    participantTwo: v.id("users"),
    lastMessage: v.optional(v.string()),
    unreadCount: v.optional(v.number()),
  }).index("by_participants", ["participantOne", "participantTwo"]),
});