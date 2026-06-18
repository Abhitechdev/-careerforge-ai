import { mutation } from "./_generated/server";

export const wipeJobMatches = mutation({
  args: {},
  handler: async (ctx) => {
    const jobMatches = await ctx.db.query("jobMatches").collect();
    for (const match of jobMatches) {
      await ctx.db.delete(match._id);
    }
    return `Deleted ${jobMatches.length} job matches.`;
  },
});
