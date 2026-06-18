import { internalMutation, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";

const MAX_FAILURES = 5;
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export const getCircuitBreakerStatus = internalQuery({
  handler: async (ctx) => {
    const state = await ctx.db.query("systemState").withIndex("by_key", (q) => q.eq("key", "CIRCUIT_BREAKER")).first();
    if (!state) return { isTripped: false, failures: 0 };
    
    const { failures, trippedAt } = state.value;
    
    if (trippedAt && (Date.now() - trippedAt < COOLDOWN_MS)) {
      return { isTripped: true, failures };
    }
    
    return { isTripped: false, failures };
  }
});

export const recordAIFailure = internalMutation({
  handler: async (ctx) => {
    const state = await ctx.db.query("systemState").withIndex("by_key", (q) => q.eq("key", "CIRCUIT_BREAKER")).first();
    const now = Date.now();
    
    if (!state) {
      await ctx.db.insert("systemState", {
        key: "CIRCUIT_BREAKER",
        value: { failures: 1, trippedAt: null },
        updatedAt: now,
      });
      return false;
    }
    
    const { failures, trippedAt } = state.value;
    if (trippedAt && (now - trippedAt < COOLDOWN_MS)) {
      return true; // Still tripped
    }
    
    const newFailures = trippedAt ? 1 : failures + 1; // Reset if cooldown passed
    const isTripping = newFailures >= MAX_FAILURES;
    
    await ctx.db.patch(state._id, {
      value: {
        failures: newFailures,
        trippedAt: isTripping ? now : null,
      },
      updatedAt: now,
    });
    
    return isTripping;
  }
});

export const recordAISuccess = internalMutation({
  handler: async (ctx) => {
    const state = await ctx.db.query("systemState").withIndex("by_key", (q) => q.eq("key", "CIRCUIT_BREAKER")).first();
    if (state && state.value.failures > 0) {
      await ctx.db.patch(state._id, {
        value: { failures: 0, trippedAt: null },
        updatedAt: Date.now(),
      });
    }
  }
});

export const getSystemStatus = query({
  handler: async (ctx) => {
    const state = await ctx.db.query("systemState").withIndex("by_key", (q) => q.eq("key", "CIRCUIT_BREAKER")).first();
    const isAiDegraded = state && state.value.trippedAt && (Date.now() - state.value.trippedAt < COOLDOWN_MS);
    
    return {
      database: "Operational",
      aiProvider: isAiDegraded ? "Degraded Performance" : "Operational",
      uploadService: "Operational"
    };
  }
});
