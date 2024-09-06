import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// this mutation is required to generate the url after uploading the file to the storage.
export const getUrl = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const createPodcast = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    voiceType: v.string(),
    voicePrompt: v.string(),
    audioUrl: v.string(),
    audioStorageId: v.id("_storage"),
    imagePrompt: v.string(),
    imageUrl: v.string(),
    imageStorageId: v.id("_storage"),
    audioDuration: v.number(),
    views: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.auth.getUserIdentity();
    if (!id) {
      throw new ConvexError("Not authenticated");
    }
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), id.email))
      .first();
    if (!user) {
      throw new ConvexError("User not found");
    }
    const podcast = await ctx.db.insert("podcasts", {
      ...args,
      user: user._id,
      author: user.name,
      authorId: user.clerkId,
      authorImageUrl: user.imageUrl,
    });
    return podcast;
  },
});

export const getTrendingPodcasts = query({
  handler: async (ctx) => {
    return await ctx.db.query("podcasts").order("desc").collect();
  },
});

export const getLatestPodcasts = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("podcasts")
      .order("desc").take(10);
  },
});